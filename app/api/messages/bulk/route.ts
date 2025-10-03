import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      recipientIds, 
      subject, 
      content, 
      messageType = 'BROADCAST', 
      priority = 'NORMAL', 
      scheduledAt,
      templateId,
      variables 
    } = body;

    // Validation
    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Recipient IDs array is required' },
        { status: 400 }
      );
    }

    if (!content && !templateId) {
      return NextResponse.json(
        { success: false, message: 'Content or template ID is required' },
        { status: 400 }
      );
    }

    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true }
    });

    if (!user?.tenantId) {
      return NextResponse.json(
        { success: false, message: 'User tenant not found' },
        { status: 400 }
      );
    }

    let processedContent = content;
    let processedSubject = subject;

    // If using a template, process variables
    if (templateId) {
      const template = await prisma.messageTemplate.findFirst({
        where: { 
          id: templateId, 
          tenantId: user.tenantId 
        }
      });

      if (!template) {
        return NextResponse.json(
          { success: false, message: 'Template not found' },
          { status: 404 }
        );
      }

      // Process template variables
      if (variables && typeof variables === 'object') {
        processedContent = template.content;
        processedSubject = template.subject || subject;

        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          processedContent = processedContent.replace(regex, value?.toString() || '');
          if (processedSubject) {
            processedSubject = processedSubject.replace(regex, value?.toString() || '');
          }
        });
      }

      // Update template usage
      await prisma.messageTemplate.update({
        where: { id: templateId },
        data: { 
          usageCount: { increment: 1 },
          lastUsedAt: new Date()
        }
      });
    }

    // Create messages for each recipient
    const messages = [];
    const communicationLogs = [];

    for (const recipientId of recipientIds) {
      // Verify recipient exists and belongs to tenant
      const recipient = await prisma.user.findFirst({
        where: { 
          id: recipientId, 
          tenantId: user.tenantId 
        }
      });

      if (!recipient) {
        console.warn(`Recipient ${recipientId} not found, skipping`);
        continue;
      }

      const messageData = {
        tenantId: user.tenantId,
        senderId: session.user.id,
        recipientId,
        subject: processedSubject,
        content: processedContent,
        messageType,
        priority,
        status: scheduledAt ? 'SCHEDULED' : 'SENT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sentAt: scheduledAt ? null : new Date()
      };

      const message = await prisma.message.create({
        data: messageData,
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          recipient: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });

      messages.push(message);

      // Create communication log
      communicationLogs.push({
        tenantId: user.tenantId,
        userId: session.user.id,
        communicationType: 'BULK_MESSAGE',
        messageId: message.id,
        templateId,
        recipientId,
        recipientType: 'INDIVIDUAL',
        channel: 'IN_APP',
        status: scheduledAt ? 'PENDING' : 'SENT'
      });
    }

    // Bulk create communication logs
    if (communicationLogs.length > 0) {
      await prisma.communicationLog.createMany({
        data: communicationLogs
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        messagesSent: messages.length,
        messages
      },
      message: `Bulk message sent to ${messages.length} recipients`
    });

  } catch (error) {
    console.error('Error sending bulk message:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send bulk message',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

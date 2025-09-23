# Library Management System - User Guide

## 🎯 **Quick Start Guide**

Welcome to the comprehensive Library Management System! This guide will help you navigate and use all the library features efficiently.

---

## 📋 **Table of Contents**

1. [Getting Started](#getting-started)
2. [User Roles and Permissions](#user-roles-and-permissions)
3. [Library Dashboard Overview](#library-dashboard-overview)
4. [Book Catalog Management](#book-catalog-management)
5. [Book Circulation](#book-circulation)
6. [Reservations System](#reservations-system)
7. [Search and Filtering](#search-and-filtering)
8. [Reports and Analytics](#reports-and-analytics)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#frequently-asked-questions)

---

## 🚀 **Getting Started**

### Accessing the Library System
1. Log into your school dashboard
2. Click on **"Library"** in the left sidebar navigation
3. The library dashboard will load with an overview of your library statistics

### Navigation Structure
The library system uses a tabbed interface:
- **Overview** - Dashboard with key statistics and metrics
- **Book Catalog** - Browse and manage your book collection
- **Circulation** - Track borrowed and returned books
- **Reservations** - Manage book reservations and holds
- **Reports** - Generate detailed library reports

---

## 👥 **User Roles and Permissions**

### **Super Admin**
- Full access to all library features across all tenants
- Can create and manage library permissions
- Access to system-wide library analytics

### **School Admin / Tenant Admin**
- Complete library management within their school
- Can add, edit, and remove books
- Full circulation and reservation management
- Access to library reports and analytics

### **Librarian**
- Specialized role with full library management access
- Book cataloging and inventory management
- Circulation operations (issue/return/renew)
- Fine management and user assistance

### **Teacher**
- Can browse the book catalog
- Basic circulation operations for classroom needs
- View library statistics and popular books

### **Student**
- Read-only access to book catalog
- Can search and browse available books
- View their own borrowing history (when implemented)

---

## 📊 **Library Dashboard Overview**

### Statistics Cards
The dashboard displays key metrics:

- **Total Books** - Complete catalog count with available copies
- **Currently Borrowed** - Books currently on loan
- **Overdue Books** - Books past their return date (requires attention)
- **Library Users** - Total registered library users

### Quick Stats
- **Outstanding Fines** - Total unpaid fines and count
- **Popular Books** - Most frequently borrowed titles

### Quick Actions
- **Add Book** - Opens the book creation modal
- **Issue/Return** - Opens circulation management modal
- **Export Data** - Download library data in various formats

---

## 📚 **Book Catalog Management**

### Adding New Books

1. Click the **"Add Book"** button in the dashboard header
2. Fill out the comprehensive book information form:

#### **Basic Information** (Required)
- **Title*** - Main book title
- **Author*** - Primary author name
- **Category*** - Select from predefined categories
- **Co-Author** - Secondary author (if applicable)
- **Genre** - Book genre or subject area

#### **Publication Details**
- **ISBN** - International Standard Book Number
- **Publisher** - Publishing company
- **Published Year** - Year of publication
- **Edition** - Book edition (1st, 2nd, Revised, etc.)
- **Language** - Book language (default: English)
- **Pages** - Total page count

#### **Library Management**
- **Total Copies*** - Number of copies owned
- **Condition** - Book condition (Excellent/Good/Fair/Poor)
- **Status** - Active or Inactive
- **Barcode** - Library barcode number
- **Location** - Shelf or storage location
- **Classification** - Dewey Decimal or other system

#### **Acquisition Details**
- **Acquisition Type** - Purchase/Donation/Gift/Exchange
- **Acquisition Date** - Date acquired
- **Price** - Cost per copy (optional)

#### **Additional Information**
- **Description** - Brief book summary
- **Cover Image URL** - Link to book cover
- **Digital Resource URL** - Link to e-book version
- **Notes** - Additional remarks

### Editing Books
1. Navigate to the Book Catalog tab
2. Find the book you want to edit
3. Click **"View Details"** on the book card
4. Use the edit functionality to update information

### Book Status Management
- **Active** - Available for circulation
- **Inactive** - Not available for borrowing
- **Lost** - Missing from inventory
- **Damaged** - Requires repair
- **Withdrawn** - Removed from circulation

---

## 🔄 **Book Circulation**

### Issuing Books

1. Click **"Issue/Return"** button in the dashboard
2. Select the **"Issue Book"** tab
3. Follow these steps:

#### Step 1: Select Book
- Use the search bar to find books by title, author, or ISBN
- Click on the desired book from search results
- Verify the book has available copies

#### Step 2: Select User
- Choose the user type (Student/Teacher/Staff)
- Search for the user by name or email
- Select the borrower from the results

#### Step 3: Set Details
- **Due Date** - Defaults to 2 weeks, can be customized
- **Notes** - Optional borrowing notes

#### Step 4: Complete Transaction
- Review the details
- Click **"Issue Book"** to complete

### Returning Books

1. In the Issue/Return modal, select **"Return Book"** tab
2. Search for the borrowed book by:
   - Book title
   - User name
   - ISBN number

3. Select the circulation record
4. Set return details:
   - **Book Condition** - Assess current condition
   - **Fine Amount** - Add any applicable fines
   - **Return Notes** - Document any issues

5. Click **"Return Book"** to complete

### Renewing Books

Books can be renewed if:
- No active reservations exist
- Maximum renewal limit not reached
- User has no outstanding fines

1. Find the circulation record
2. Click **"Renew"** 
3. Set new due date
4. Add renewal notes if needed

---

## 📅 **Reservations System**

### Creating Reservations

When a book is not available:
1. Search for the desired book
2. Click **"Reserve"** if no copies are available
3. The system will:
   - Add you to the priority queue
   - Set a 7-day reservation expiry
   - Notify you when the book becomes available

### Managing Reservations

**For Library Staff:**
- View all active reservations
- Process reservations when books are returned
- Cancel expired or unwanted reservations
- Adjust priority order if necessary

**For Users:**
- View your active reservations
- Cancel reservations if no longer needed
- Check your position in the queue

---

## 🔍 **Search and Filtering**

### Advanced Search Options

#### Search Fields
- **Title** - Exact or partial title matching
- **Author** - Primary or co-author names
- **ISBN** - Exact ISBN matching
- **Publisher** - Publishing company
- **Category** - Predefined categories

#### Filter Options
- **Category** - Fiction, Non-Fiction, Science, etc.
- **Availability** - Show only available books
- **Condition** - Filter by book condition
- **Status** - Active or inactive books
- **Author** - Filter by specific authors

#### Search Tips
- Use partial words for broader results
- Combine filters for precise searches
- Clear filters to expand your search
- Use the "Available Only" filter for immediate borrowing

---

## 📈 **Reports and Analytics**

### Available Reports

#### **Overview Statistics**
- Total books in catalog
- Circulation activity
- Overdue items
- User engagement metrics

#### **Popular Books Report**
- Most borrowed titles
- Trending categories
- User preferences analysis
- Seasonal borrowing patterns

#### **Circulation Report**
- Daily/weekly/monthly borrowing activity
- Return rate statistics
- Renewal frequency
- Late return analysis

#### **Inventory Report**
- Complete catalog listing
- Condition assessment summary
- Missing or damaged items
- Acquisition history

#### **Financial Report**
- Fine collection summary
- Unpaid fine tracking
- Acquisition costs
- Budget utilization

### Generating Reports

1. Navigate to the **Reports** tab
2. Select your desired report type
3. Set date ranges and filters
4. Choose export format (PDF/Excel/CSV)
5. Click **"Generate Report"**

---

## 🛠️ **Troubleshooting**

### Common Issues and Solutions

#### **Cannot Issue Book**
**Problem:** "Book not available" error
**Solutions:**
- Check if all copies are currently borrowed
- Verify book status is "Active"
- Ensure user hasn't exceeded borrowing limits

#### **Search Not Working**
**Problem:** No results found
**Solutions:**
- Clear all filters and try again
- Check spelling in search terms
- Try partial word searches
- Verify the book exists in your school's catalog

#### **User Not Found**
**Problem:** Cannot find borrower in system
**Solutions:**
- Verify the person is registered in your school system
- Check if they have an active account
- Contact system administrator for user creation

#### **Fine Calculation Issues**
**Problem:** Incorrect fine amounts
**Solutions:**
- Verify the book's actual return date
- Check fine calculation rules in system settings
- Manually adjust fine amount if necessary

### System Performance

#### **Slow Loading**
- Clear browser cache and cookies
- Check internet connection
- Try refreshing the page
- Contact technical support if persistent

#### **Data Not Updating**
- Refresh the page
- Log out and log back in
- Check if you have proper permissions
- Verify system maintenance isn't in progress

---

## ❓ **Frequently Asked Questions**

### **General Usage**

**Q: How many books can a user borrow at once?**
A: Default limits are:
- Students: 5 books
- Teachers: 10 books  
- Staff: 7 books
(Limits can be customized by administrators)

**Q: How long is the standard borrowing period?**
A: Default is 2 weeks, but can be adjusted based on user type and book category.

**Q: Can books be renewed?**
A: Yes, books can be renewed up to 2 times by default, provided there are no active reservations.

### **Book Management**

**Q: Can I add books without ISBN numbers?**
A: Yes, ISBN is optional. However, it's recommended for better catalog organization.

**Q: How do I handle damaged books?**
A: Update the book condition to "Damaged" and add notes about the specific damage.

**Q: Can I delete books from the catalog?**
A: Books can only be deleted if they have no circulation history. Otherwise, mark them as "Withdrawn."

### **Circulation**

**Q: What happens to overdue books?**
A: The system tracks overdue books and can calculate automatic fines based on your school's policy.

**Q: How do reservations work?**
A: When you reserve a book, you're added to a priority queue. You'll be notified when it's your turn.

**Q: Can I issue books to external users?**
A: Only registered users in your school system can borrow books.

### **Reports and Data**

**Q: Can I export library data?**
A: Yes, most reports can be exported in PDF, Excel, or CSV formats.

**Q: How often are statistics updated?**
A: Library statistics are updated in real-time as transactions occur.

**Q: Can I see historical borrowing data?**
A: Yes, the system maintains complete circulation history for reporting purposes.

### **Technical Support**

**Q: Who do I contact for technical issues?**
A: Contact your school's system administrator or IT support team.

**Q: Can I access the library system from mobile devices?**
A: Yes, the system is fully responsive and works on tablets and smartphones.

**Q: Is my data secure?**
A: Yes, all library data is encrypted and isolated within your school's tenant for security.

---

## 📞 **Support and Contact**

### Getting Help

1. **Check this user guide** for common questions
2. **Contact your school librarian** for library-specific help
3. **Reach out to IT support** for technical issues
4. **Consult your system administrator** for permission issues

### Feature Requests

If you have suggestions for improving the library system:
1. Document your request clearly
2. Explain the business benefit
3. Submit through your school's IT request process

---

## 🎉 **Conclusion**

The Library Management System provides comprehensive tools for managing your school's library efficiently. With proper use of its features, you can:

- Maintain an organized book catalog
- Streamline circulation processes
- Provide excellent service to library users
- Generate insightful reports for decision-making
- Ensure proper inventory management

Remember to regularly update book information, process returns promptly, and use the analytics features to understand your library's usage patterns.

**Happy Library Management!** 📚

---

*Last Updated: January 2024*
*Version: 1.0*
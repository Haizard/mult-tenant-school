import { FaBook, FaBookMedical, FaBookOpen, FaBookReader } from "react-icons/fa";

const LibraryItem = ({ icon, title, files }) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-lg">
                {icon}
            </div>
            <div>
                <p className="font-bold text-text-primary">{title}</p>
                <p className="text-sm text-text-secondary">{files} files</p>
            </div>
        </div>
        <a href="#" className="text-accent-purple text-sm font-medium">Read now</a>
    </div>
)

const Library = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Library</h2>
                <a href="#" className="text-sm text-accent-purple font-medium">View All</a>
            </div>
            <div>
                <LibraryItem icon={<FaBookReader className="text-orange-500" />} title="Literature" files={302} />
                <LibraryItem icon={<FaBookMedical className="text-blue-500" />} title="Mathematics" files={1872} />
                <LibraryItem icon={<FaBookOpen className="text-yellow-500" />} title="English" files={575} />
                <LibraryItem icon={<FaBook className="text-red-500" />} title="Science" files={249} />
            </div>
        </div>
    )
}

export default Library;

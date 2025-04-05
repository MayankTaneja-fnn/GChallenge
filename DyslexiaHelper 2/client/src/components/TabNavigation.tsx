interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabNavigation({
  activeTab,
  setActiveTab,
}: TabNavigationProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg mb-8 p-4">
      <div className="flex flex-col md:flex-row">
        <button
          id="tab-text-tools"
          className={`flex-1 p-5 text-center font-bold border-b-4 transition-colors duration-300 ${
            activeTab === "text-tools"
              ? "border-green-600 text-green-700 bg-green-100"
              : "border-transparent text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("text-tools")}
        >
          <i className="fas fa-file-alt mr-2"></i>
          <span>Text Tools 📄</span>
        </button>
        <button
          id="tab-chat"
          className={`flex-1 p-5 text-center font-bold border-b-4 transition-colors duration-300 ${
            activeTab === "chat"
              ? "border-green-600 text-green-700 bg-green-100"
              : "border-transparent text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          <i className="fas fa-comments mr-2"></i>
          <span>Chat Assistant 🤖</span>
        </button>
      </div>
    </div>
  );
}

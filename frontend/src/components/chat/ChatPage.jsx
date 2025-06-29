import { useParams } from 'react-router-dom';
import ChatInterface from "@/pages/chat/ChatInterface";

export default function ChatPage() {
    const { chatId } = useParams();
    
    return (
        <div className="container mx-auto px-4 py-6">
            <div className="text-2xl font-bold mb-2"></div>
            <ChatInterface initialChatId={chatId} />
        </div>
    );
}
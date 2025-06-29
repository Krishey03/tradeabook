import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const ChatContext = createContext();

const useChat = () => {
  return useContext(ChatContext);
};

const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const socket = useRef(null);

  // ✅ Memoized fetchChats to prevent infinite loop
  const fetchChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/chat', { withCredentials: true });
      const chats = Array.isArray(data?.chats) ? data.chats : [];
      setChats(chats);

      const count = chats.reduce((acc, chat) => {
        if (chat.lastMessage && !chat.lastMessage.readBy?.includes(user?._id)) {
          return acc + 1;
        }
        return acc;
      }, 0);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]); // fallback
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]); // Only depend on user ID

  const initiateChat = async (email) => {
    try {
      const { data } = await axios.post(
        '/chat/initiate',
        { email },
        { withCredentials: true }
      );
      setChats((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error initiating chat:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!user?._id) return;

    if (!socket.current) {
      socket.current = io(import.meta.env.VITE_BACKEND_URL, {
        withCredentials: true,
        transports: ['websocket']
      });
    }

    fetchChats();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [user?._id, fetchChats]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        unreadCount,
        isLoading,
        fetchChats,
        initiateChat,
        socket: socket.current
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatProvider, useChat };

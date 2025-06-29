import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import axios from 'axios';

export default function InitiateChatButton() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInitiateChat = async () => {
    if (!email) {
      setError('Please enter an email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const { data } = await axios.post(
        `${backendUrl}/chat/initiate`,
        { email },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Navigate to the new chat
      navigate(`/chat/${data.data?._id || data.chat?._id}`);
    } catch (err) {
      console.error('Chat initiation error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to initiate chat. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="whitespace-nowrap"
        >
          Start New Chat
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Start a new chat</DialogTitle>
          <DialogDescription id="dialog-description">
            Enter the email of the user you want to chat with
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="email"
            placeholder="Enter recipient's email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            disabled={isLoading}
          />
          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setEmail('');
                setError('');
              }}
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button 
              onClick={handleInitiateChat}
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Starting...
                </span>
              ) : 'Start Chat'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
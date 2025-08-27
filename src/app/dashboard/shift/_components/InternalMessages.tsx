'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { Button } from '~/app/_components/ui/button';
import { Input } from '~/app/_components/ui/input';

interface InternalMessagesProps {
  houseId: string;
}

export function InternalMessages({ houseId }: InternalMessagesProps) {
  const [newMessage, setNewMessage] = useState('');

  const { data: messages, refetch } = api.sigalit.getInternalMessages.useQuery({
    houseId,
    limit: 10,
  });

  const createMessageMutation = api.sigalit.createInternalMessage.useMutation({
    onSuccess: () => {
      refetch();
      setNewMessage('');
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    void createMessageMutation.mutate({
      houseId,
      content: newMessage.trim(),
    });
  };

  return (
    <div className="space-y-4">
      {/* New Message Input */}
      <div className="space-y-3">
        <Input
          placeholder="כתוב הודעה חדשה..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="text-right"
        />
        <Button
          onClick={handleSendMessage}
                      disabled={!newMessage.trim() || createMessageMutation.isPending}
          className="w-full bg-sigalit-500 hover:bg-sigalit-600 text-white"
        >
          + שיחה חדשה
        </Button>
      </div>

      {/* Messages List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg border ${
                message.isRead 
                  ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {message.sender.name}
                  </span>
                  {!message.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleDateString('he-IL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {message.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            אין הודעות
          </div>
        )}
      </div>
    </div>
  );
}

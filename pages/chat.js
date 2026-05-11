import { useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Api } from '@/services/service';
import { userContext } from './_app';
import { useRouter } from 'next/router';
import isAuth from '@/components/isAuth';
import { IoArrowBack, IoSend, IoChatbubbleEllipses } from 'react-icons/io5';
import { MdShoppingBag } from 'react-icons/md';
import moment from 'moment';

const SOCKET_URL = 'https://api.merkapp.net';

function SellerChat(props) {
  const [user] = useContext(userContext);
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [showList, setShowList] = useState(true);
  const [search, setSearch] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    props.loader(true);
    Api('get', 'chat/seller', null, router).then(
      (res) => {
        props.loader(false);
        if (res.status) setChats(res.data);
      },
      () => props.loader(false)
    );
  }, [user?._id]);

  useEffect(() => {
    if (!activeChat?._id || !user?.token) return;

    setMessages(activeChat.messages || []);

    if (socketRef.current) socketRef.current.disconnect();

    const socket = io(SOCKET_URL, { auth: { token: user.token } });
    socketRef.current = socket;
    socket.emit('join_chat', activeChat._id);

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setChats((prev) =>
        prev.map((c) =>
          c._id === activeChat._id
            ? { ...c, messages: [...(c.messages || []), msg] }
            : c
        )
      );
    });

    return () => socket.disconnect();
  }, [activeChat?._id, user?.token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current || !activeChat?._id) return;
    socketRef.current.emit('send_message', { chatId: activeChat._id, text: text.trim() });
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openChat = (chat) => {
    setActiveChat(chat);
    setShowList(false);
  };

  const getLastMessage = (chat) => {
    const msgs = chat.messages || [];
    if (!msgs.length) return 'No messages yet';
    return msgs[msgs.length - 1].text;
  };

  const getLastTime = (chat) => {
    const msgs = chat.messages || [];
    if (!msgs.length) return '';
    return moment(msgs[msgs.length - 1].createdAt).fromNow();
  };

  const getUnread = (chat) => {
    return 0;
  };

  const filteredChats = chats.filter((c) => {
    const name = `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const Avatar = ({ name, size = 'md' }) => {
    const letter = name?.[0]?.toUpperCase() || 'U';
    const sz = size === 'lg' ? 'w-12 h-12 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    return (
      <div className={`${sz} rounded-full bg-gradient-to-br from-[#12344D] to-[#1a5276] flex items-center justify-center text-white font-bold flex-shrink-0`}>
        {letter}
      </div>
    );
  };

  return (
    <section className="w-full h-full bg-transparent md:pt-5 pt-3 pb-5 pl-5 pr-5 relative z-10">
      <p className="text-gray-800 font-bold md:text-[28px] text-xl mb-4 flex items-center gap-2">
        <IoChatbubbleEllipses className="text-[#12344D]" />
        Customer Chats
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex" style={{ height: 'calc(100vh - 160px)' }}>

        <div className={`${showList ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-[320px] border-r border-gray-100 flex-shrink-0`}>
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Conversations ({filteredChats.length})
            </p>
            <input
              className="w-full bg-white border text-gray-700 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#12344D] placeholder-gray-400"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10">
                <IoChatbubbleEllipses className="text-gray-300 text-5xl mb-3" />
                <p className="text-gray-400 text-sm font-medium">No conversations yet</p>
                <p className="text-gray-300 text-xs mt-1">Customers will appear here when they message you</p>
              </div>
            )}
            {filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => openChat(chat)}
                className={`px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-all relative ${
                  activeChat?._id === chat._id ? 'bg-blue-50 border-l-4 border-l-[#12344D]' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={chat.user?.firstName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {chat.user?.firstName} {chat.user?.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{getLastTime(chat)}</p>
                    </div>
                    {chat.product && (
                      <p className="text-xs text-[#E38D11] truncate flex items-center gap-1">
                        <MdShoppingBag size={10} />
                        {chat.product.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 truncate mt-0.5">{getLastMessage(chat)}</p>
                  </div>
                </div>
                {chat.hasOrder && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <MdShoppingBag size={10} /> Has Order
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`${!showList ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <IoChatbubbleEllipses className="text-gray-300 text-4xl" />
              </div>
              <p className="text-gray-500 font-semibold text-base">Select a conversation</p>
              <p className="text-gray-400 text-sm mt-1">Choose a customer from the left to start chatting</p>
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 bg-white shadow-sm flex-shrink-0">
                <div className="px-4 py-3 flex items-center gap-3">
                  <button
                    className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-all"
                    onClick={() => setShowList(true)}
                  >
                    <IoArrowBack size={20} />
                  </button>
                  <Avatar name={activeChat.user?.firstName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {activeChat.user?.firstName} {activeChat.user?.lastName}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {activeChat.hasOrder ? (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <MdShoppingBag size={10} /> Has Order
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                          General Inquiry
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {activeChat.hasOrder && activeChat.orderedProducts?.length > 0 && (
                  <div className="px-4 pb-2">
                    <p className="text-[10px] text-amber-600 font-semibold mb-1">Ordered Products</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {activeChat.orderedProducts.map((prod, i) => {
                        const img = prod?.varients?.[0]?.image?.[0] || prod?.images?.[0] || null;
                        return (
                          <div key={i} className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 flex-shrink-0">
                            {img ? (
                              <img src={img} alt={prod.name} className="w-7 h-7 rounded object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <MdShoppingBag className="text-amber-400" size={12} />
                              </div>
                            )}
                            <p className="text-xs text-gray-700 truncate max-w-[100px]">{prod.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-gray-400 text-sm">No messages yet</p>
                    <p className="text-gray-300 text-xs mt-1">Start the conversation</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMine = msg.sender === user?._id || msg.sender?._id === user?._id;
                  const showTime =
                    i === 0 ||
                    moment(msg.createdAt).diff(moment(messages[i - 1]?.createdAt), 'minutes') > 5;
                  return (
                    <div key={i}>
                      {showTime && (
                        <div className="flex justify-center my-2">
                          <span className="text-[10px] text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                            {moment(msg.createdAt).calendar()}
                          </span>
                        </div>
                      )}
                      <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        {!isMine && <Avatar name={activeChat.user?.firstName} size="sm" />}
                        <div
                          className={`max-w-[70%] px-4 py-2.5 text-sm shadow-sm ${
                            isMine
                              ? 'bg-[#12344D] text-white rounded-2xl rounded-br-sm'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                            {moment(msg.createdAt).format('HH:mm')}
                          </p>
                        </div>
                        {isMine && <Avatar name={user?.firstName} size="sm" />}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-[#12344D] transition-all">
                  <input
                    ref={inputRef}
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 text-gray-800"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!text.trim()}
                    className="w-9 h-9 rounded-xl bg-[#12344D] disabled:bg-gray-300 hover:bg-[#1a4a6e] transition-all flex items-center justify-center flex-shrink-0"
                  >
                    <IoSend size={16} className="text-white" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">Press Enter to send</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default isAuth(SellerChat);

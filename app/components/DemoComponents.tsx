"use client";

import { type ReactNode, useCallback, useMemo, useState, useEffect } from "react";
import { useAuthenticate, useMiniKit } from '@coinbase/onchainkit/minikit';
import Link from 'next/link';
import { saveUserToStorage, getUserFromStorage, removeUserFromStorage, isUserAuthenticated, isAuthTokenExpired, getUserDisplayName, formatAddress, refreshAuthIfNeeded, type User } from "../utils/auth";
import { useAccount } from "wagmi";
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionError,
  TransactionResponse,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { getDefaultAvatarImage } from "@/lib/utils";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  icon,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052FF] disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary:
      "bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-[var(--app-background)]",
    secondary:
      "bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]",
    outline:
      "border border-[var(--app-accent)] hover:bg-[var(--app-accent-light)] text-[var(--app-accent)]",
    ghost:
      "hover:bg-[var(--app-accent-light)] text-[var(--app-foreground-muted)]",
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-base px-6 py-3 rounded-lg",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="flex items-center mr-2">{icon}</span>}
      {children}
    </button>
  );
}

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

function Card({
  title,
  children,
  className = "",
  onClick,
}: CardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden transition-all hover:shadow-xl ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {title && (
        <div className="px-5 py-3 border-b border-[var(--app-card-border)]">
          <h3 className="text-lg font-medium text-[var(--app-foreground)]">
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

type FeaturesProps = {};

export function Features({}: FeaturesProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Key Features">
        <ul className="space-y-3 mb-4">
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Minimalistic and beautiful UI design
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Responsive layout for all devices
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Dark mode support
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              OnchainKit integration
            </span>
          </li>
        </ul>
        <Link href="/" passHref>
          <Button variant="outline">
            Back to Home
          </Button>
        </Link>
      </Card>
    </div>
  );
}

type HomeProps = {};

export function Home({}: HomeProps) {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const { signIn } = useAuthenticate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle sign-out
  const handleSignOut = useCallback(() => {
    setIsLoading(true);
    setIsAuthenticated(false);
    setUser(null);
    setAuthError(null);
    setAuthSuccess(null);
    // Remove user data from local storage
    removeUserFromStorage();
    // You could also call an API endpoint to invalidate the session if needed
    setIsLoading(false);
  }, [setIsAuthenticated, setUser, setAuthError, setAuthSuccess, setIsLoading]);
  


  // Initialize frame when component is ready
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }

   
    tryH();
    // handleSignIn();
  }, [setFrameReady, isFrameReady]);

  const tryH = async () => {
    // Then update challenge amount in the backend
    const response = await fetch(`/api/challenges/1/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'fid': '1',
      },
      body: JSON.stringify({
        amount: 2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // throw new Error(errorData.error || 'Failed to update challenge amount');
      console.log('Failed to update challenge amount', errorData);
      return
    }

    console.log('Challenge amount updated successfully');
  }
  
  // // Check for existing authentication on component mount
  // useEffect(() => {
  //   // Check if user is already authenticated in local storage
  //   if (isUserAuthenticated()) {
  //     // Check if the auth token is expired (default 60 minutes)
  //     if (isAuthTokenExpired()) {
  //       console.log('Authentication token expired, signing out...');
  //       handleSignOut();
  //     } else {
  //       const storedUser = getUserFromStorage();
  //       setUser(storedUser);
  //       setIsAuthenticated(true);
  //       setAuthSuccess(`Welcome back, ${getUserDisplayName()}!`);
        
  //       // Clear success message after 5 seconds
  //       setTimeout(() => {
  //         setAuthSuccess(null);
  //       }, 5000);
  //     }
  //   }
  //   // Set loading to false after checking authentication
  //   setIsLoading(false);
  // }, [handleSignOut, setAuthSuccess]);

  // Handle sign-in with MiniKit
  // const handleSignIn = useCallback(async () => {
  //   try {
  //     setIsAuthenticating(true);
  //     setIsLoading(true);
  //     setAuthError(null);
      
  //     // Clear any previous success message
  //     setAuthSuccess(null);
      
  //     const nonce = Date.now().toString()
  //     // Request signature from user
  //     const result = await signIn({
  //       nonce,

  //     });

  //     console.log('Sign-in result:', result);
      
  //     if (result) {
  //       // Extract signature and message from result
  //       const { signature, message } = result;
        
  //       // Send to auth/verify endpoint
  //       const response = await fetch('/api/auth/verify', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           signature,
  //           message,
  //           nonce
  //         }),
  //       });
        
  //       const data = await response.json();
        
  //       if (data.success) {
  //         setIsAuthenticated(true);
  //         setUser(data.user);
  //         // Save user data to local storage
  //         saveUserToStorage(data.user);
  //         // Set success message
  //         setAuthSuccess(`Successfully authenticated as ${data.user.displayName || 'User'}`);
          
  //         // Clear success message after 5 seconds
  //         setTimeout(() => {
  //           setAuthSuccess(null);
  //         }, 5000);
          
  //         console.log('Authentication successful:', data.user);
  //       } else {
  //         setAuthError(data.error || 'Authentication failed');
  //         setIsAuthenticated(false);
  //         setUser(null);
  //         // Remove user data from local storage
  //         removeUserFromStorage();
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Sign-in error:', error);
  //     setAuthError(error instanceof Error ? error.message : 'Authentication failed');
  //     setIsAuthenticated(false);
  //   } finally {
  //     setIsAuthenticating(false);
  //     setIsLoading(false);
  //   }
  // }, [signIn, setIsAuthenticated, setIsAuthenticating, setAuthError, setAuthSuccess, setUser, setIsLoading]);
  
  // // Handle refresh authentication
  // const handleRefreshAuth = useCallback(async (): Promise<boolean> => {
  //   try {
  //     setIsLoading(true);
  //     // Call handleSignIn to refresh authentication
  //     await handleSignIn();
  //     return true;
  //   } catch (error) {
  //     console.error('Error refreshing authentication:', error);
  //     return false;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [handleSignIn]);

  // // Check authentication status when context changes
  // useEffect(() => {
  //   // Only attempt automatic authentication if:
  //   // 1. Frame is ready
  //   // 2. User is not already authenticated (either from local storage or previous auth)
  //   // 3. Not currently in the process of authenticating
  //   // 4. No stored authentication exists
  //   if (isFrameReady && !isAuthenticated && !isAuthenticating && !isUserAuthenticated()) {
  //     handleSignIn();
  //   } else if (isFrameReady && isAuthenticated && !isAuthenticating) {
  //     // Check if authentication needs to be refreshed (token expired)
  //     refreshAuthIfNeeded(handleRefreshAuth, 30) // Refresh if token is older than 30 minutes
  //       .then(refreshed => {
  //         if (refreshed) {
  //           console.log('Authentication refreshed successfully');
  //         }
  //       })
  //       .catch(error => {
  //         console.error('Error refreshing authentication:', error);
  //       });
  //   }
  // }, [isFrameReady, isAuthenticated, isAuthenticating, handleSignIn, handleRefreshAuth]);

  return (
    <div>
      {isLoading || !isFrameReady ? (
        <div className="flex flex-col h-[calc(88vh-44px)] animate-fade-in items-center justify-center p-6 bg-[#F9FAFB]">
          <div className="space-y-4 text-center">
            <div className="w-24 h-24 bg-[#00C896] rounded-full flex items-center justify-center mx-auto animate-pulse">
              <span className="text-4xl">💰</span>
            </div>
            <p className="text-[#333333] font-bold">Loading SaveUp...</p>
            <p className="text-sm text-[#14213D]">Please wait while we set things up</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(88vh-44px)] animate-fade-in items-center justify-between p-6 bg-[#F9FAFB]">
        {/* User Profile Section */}
        <div className="mt-16 mb-8 text-center">
          {isAuthenticated && isFrameReady && context?.user ? (
            <div className="space-y-1">
              <div className="w-16 h-16 bg-[#00C896] rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">💰</span>
                <img
                  src={context?.user?.pfpUrl || getDefaultAvatarImage(context?.user?.fid??'')}
                  alt={context?.user?.displayName}
                  width={48}
                  height={48}
                  className="rounded-full" />
              </div>
              <h2 className="text-xl font-bold text-[#333333]">
              {context?.user?.displayName} {/* {getUserDisplayName('SaveUp User')}  */}
              </h2>
              {/* <p className="text-sm text-[#14213D]">
              {context?.user?.username} {formatAddress(user.address)}
              </p> */}
              {/* <p className="text-xs text-[#14213D] opacity-70">
                Last active: {new Date(user.lastSaved || user.timestamp || '').toLocaleString()}
              </p> */}
            </div>
          ) :  
          //     && !isAuthenticated ? 
          //     // (
          //   //   <div className="space-y-1">
          //   //     <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
          //   //       <span className="text-2xl">👤</span>
          //   //     </div>
          //   //     <h2 className="text-xl font-bold text-[#333333]">
          //   //       Not Signed In
          //   //     </h2>
          //   //     <p className="text-sm text-[#14213D]">
          //   //       {isAuthenticating ? 'Authenticating...' : 'Please sign in to continue'}
          //   //     </p>
          //   //   </div>
          //   // ) 
          //   (
          //       <div className="space-y-1">
          //         <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
          //           <span className="text-2xl">👤</span>
          //         </div>
          //       </div>
          //   ) 
          //   : 
          (
            <div className="space-y-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <span className="text-4xl">🔄</span>
              </div>
              <p className="text-sm text-[#14213D]">Connecting to Farcaster...</p>
            </div>
          )}
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#14213D] text-[var(--app-foreground-muted)] mb-3">
            Welcome to SaveUP
          </h1>
          <p className="text-lg text-[#333333]">
            Build better onchain savings.
          </p>
        </div>

        {/* CTA Button */}
        <div className="w-full max-w-xs mb-8 space-y-4">
          {/* {!isAuthenticated ? (
            <Button
              className="w-full rounded-xl mb-4"
              onClick={handleSignIn}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? 'Authenticating...' : 'Sign In with Farcaster'}
            </Button>
          ) : (
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                onClick={handleRefreshAuth}
                variant="outline"
                className="text-[#00C896] border-[#00C896] hover:bg-[#00C896] hover:text-white"
                disabled={isAuthenticating || isLoading}
              >
                Refresh
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="text-[#14213D] border-[#14213D] hover:bg-[#14213D] hover:text-white"
                disabled={isAuthenticating || isLoading}
              >
                Sign Out
              </Button>
            </div>
          )}
          {authError && (
            <p className="text-sm text-[#FF6B6B] text-center">{authError}</p>
          )}
          {authSuccess && (
            <p className="text-sm text-[#1DB954] text-center">{authSuccess}</p>
          )} */}
          <Link href="/landing" passHref>
            <Button
              className="w-full rounded-xl"
              icon={<Icon name="arrow-right" size="sm" />}
            >
              Get started
            </Button>
          </Link>
        </div>
      </div>
      )}
    </div>
  );
}

type IconProps = {
  name: "heart" | "star" | "check" | "plus" | "arrow-right";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Icon({ name, size = "md", className = "" }: IconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const icons = {
    heart: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Heart</title>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    star: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Star</title>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    check: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Check</title>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    plus: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Plus</title>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    "arrow-right": (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Arrow Right</title>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
  };

  return (
    <span className={`inline-block ${sizeClasses[size]} ${className}`}>
      {icons[name]}
    </span>
  );
}

type Todo = {
  id: number;
  text: string;
  completed: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Learn about MiniKit", completed: false },
    { id: 2, text: "Build a Mini App", completed: true },
    { id: 3, text: "Deploy to Base and go viral", completed: false },
  ]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim() === "") return;

    const newId =
      todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
    setTodos([...todos, { id: newId, text: newTodo, completed: false }]);
    setNewTodo("");
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <Card title="Get started">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
          />
          <Button
            variant="primary"
            size="md"
            onClick={addTodo}
            icon={<Icon name="plus" size="sm" />}
          >
            Add
          </Button>
        </div>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id={`todo-${todo.id}`}
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    todo.completed
                      ? "bg-[var(--app-accent)] border-[var(--app-accent)]"
                      : "border-[var(--app-foreground-muted)] bg-transparent"
                  }`}
                >
                  {todo.completed && (
                    <Icon
                      name="check"
                      size="sm"
                      className="text-[var(--app-background)]"
                    />
                  )}
                </button>
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={`text-[var(--app-foreground-muted)] cursor-pointer ${todo.completed ? "line-through opacity-70" : ""}`}
                >
                  {todo.text}
                </label>
              </div>
              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}


function TransactionCard() {
  const { address } = useAccount();

  // Example transaction call - sending 0 ETH to self
  const calls = useMemo(() => address
    ? [
        {
          to: address,
          data: "0x" as `0x${string}`,
          value: BigInt(0),
        },
      ]
    : [], [address]);

  const sendNotification = useNotification();

  const handleSuccess = useCallback(async (response: TransactionResponse) => {
    const transactionHash = response.transactionReceipts[0].transactionHash;

    console.log(`Transaction successful: ${transactionHash}`);

    await sendNotification({
      title: "Congratulations!",
      body: `You sent your a transaction, ${transactionHash}!`,
    });
  }, [sendNotification]);

  return (
    <Card title="Make Your First Transaction">
      <div className="space-y-4">
        <p className="text-[var(--app-foreground-muted)] mb-4">
          Experience the power of seamless sponsored transactions with{" "}
          <a
            href="https://onchainkit.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0052FF] hover:underline"
          >
            OnchainKit
          </a>
          .
        </p>

        <div className="flex flex-col items-center">
          {address ? (
            <Transaction
              calls={calls}
              onSuccess={handleSuccess}
              onError={(error: TransactionError) =>
                console.error("Transaction failed:", error)
              }
            >
              <TransactionButton className="text-white text-md" />
              <TransactionStatus>
                <TransactionStatusAction />
                <TransactionStatusLabel />
              </TransactionStatus>
              <TransactionToast className="mb-4">
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </TransactionToast>
            </Transaction>
          ) : (
            <p className="text-yellow-400 text-sm text-center mt-2">
              Connect your wallet to send a transaction
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

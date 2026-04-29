import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserDirectoryPage } from '../components/UserDirectoryPage';
import { getUsers, type User } from '../lib/api';

export function Users() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const response = await getUsers();

        if (!isMounted) {
          return;
        }

        setUsers(response.users);
      } catch {
        if (isMounted) {
          setError('Failed to load users');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <UserDirectoryPage
      backTo="/feed"
      backLabel="Back to feed"
      title="Users"
      subtitle="Browse everyone on the app"
      onLogout={handleLogout}
      error={error}
      isLoading={isLoading}
      loadingMessage="Loading users..."
      emptyMessage="No users found."
      users={users}
    />
  );
}

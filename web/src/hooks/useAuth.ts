import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';


interface User {
  id: string;
  full_name: string
  email: string
  role: 'admin' | 'manager' | 'viewer'
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)

  }, []);

  const signIn = async (email: string, password: string) => {

    try {

      const response = await api.post('/sessions', {
        email,
        password
      })
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      setUser(userData)

      return { error: null }
    } catch (error) {
      console.error(error)
      const errorMessage = error.response?.data?.message || 'Falha ao entrar!!'
      return { error: { message: errorMessage } };
    }
  };

  const signUp = async (email: string, password: string, full_name: string) => {


    try {
      await api.post('/users', {
        email,
        password,
        full_name
      })
      return { error: null }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Falha ao cadastrar.';
      return { error: { message: errorMessage } };
    }

  }

  const signOut = async () => {

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setUser(null)
    delete api.defaults.headers.common['Authorization']

    navigate('/');
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    session: user ? { user } : null
  };
};

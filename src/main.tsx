import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider
} from "react-router-dom"
import { Provider, useDispatch } from 'react-redux'
import store from './redux/store.tsx'
import Cookies from 'js-cookie'
import axios from 'axios'

import './index.css'

// ==================== PAGES ====================

// General
import Main from './pages/Main'
import Home from './pages/Home/home'
import Search from './pages/Search/search.tsx'
import Page404 from './pages/404/Page404.tsx'
import AboutUs from './pages/About/aboutUs.tsx'
import Message from './pages/Message/Message.tsx'

// Auth
import Register from './pages/Auth/Register/register.tsx'
import LogIn from './pages/Auth/LogIn/login.tsx'
import ConfirmEmail from './pages/Auth/ConfirmEmail/confirmEmail.tsx'
import ForgetPassword from './pages/Auth/ForgetPassword/ForgetPassword.tsx'
import ResetPassword from './pages/Auth/ResetPassword/ResetPassword.tsx'

// User
import UserInfo from './pages/User/Info/userInfo.tsx'
import UserPosts from './pages/User/Posts/userPosts.tsx'
import EditProfile from './pages/User/Edit/editProfile.tsx'
import Followers from './pages/User/Followers/followers.tsx'
import Following from './pages/User/Following/following.tsx'
import FollowRequests from './pages/User/FollowRequests/followRequests.tsx'

// Posts
import Post from './pages/Post/Render/Render.tsx'
import CreatePost from './pages/Post/Create/createPost.tsx'

// Function to check if user is authenticated
const isAuthenticated = async () => {
  const userToken = Cookies.get('userToken')

  try {
    const response = await axios.get('http://localhost:3000/auth/user', { headers: { Authorization: `Bearer ${userToken}` } })
    return { isAuth: response.status !== 400, response}
  } catch (error) {
    return false
  }
}

const getTodayQuestion = async() => {
  const userToken = Cookies.get('userToken')

  try{
    const date = new Date()
    const todayDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getFullYear())}`

    const response = await axios.get(`http://localhost:3000/question/${todayDate}`,
    { headers: { Authorization: `Bearer ${userToken}` } })

    return {
      date: todayDate,
      question: response.data.question
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

// Private Route Component
const PrivateRoute = ({ element }: any) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = React.useState(true)
  const [authenticated, setAuthenticated] = React.useState(false)

  React.useEffect(() => {
    isAuthenticated().then((authenticated: any) => {
      getTodayQuestion().then((question: any) => {
        setAuthenticated(authenticated.isAuth)

        // dispatch user data
        dispatch({ type: 'user', payload: {
          name: authenticated.response.data.user.name,
          id: authenticated.response.data.user._id,
          pfp: authenticated.response.data.user.profile_picture,
          private: authenticated.response.data.user.private
        } })

        // dispatch question data
        dispatch({ type: 'question', payload: {...question} })

        setLoading(false)
      })
      
    })
  }, [])

  if (loading) return <div>Loading...</div>

  return authenticated ? element : <Navigate to="/message?msg=VOCE PRECISA SE AUTENTICAR ANTES" replace />
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main></Main>,
    children: [
      {
        path: "*",
        element: <Page404></Page404>
      },
      {
        path: '/',
        element: <Home></Home>
      },
      {
        path: '/about',
        element: <AboutUs></AboutUs>
      },
      {
        path: '/register',
        element: <Register></Register>
      },
      {
        path: '/confirm_email',
        element: <ConfirmEmail></ConfirmEmail>
      },
      {
        path: '/forget_password',
        element: <ForgetPassword></ForgetPassword>
      },
      {
        path: '/reset_password',
        element: <ResetPassword></ResetPassword>
      },
      {
        path: '/follow_requests',
        element: <PrivateRoute element={<FollowRequests />}></PrivateRoute>
      },
      {
        path: '/message',
        element: <Message></Message>
      },
      {
        path: '/login',
        element: <LogIn></LogIn>
      },
      {
        path: '/:name',
        element: <PrivateRoute element={<UserInfo />}></PrivateRoute>
      },
      {
        path: '/:name/followers',
        element: <PrivateRoute element={<Followers />}></PrivateRoute>
      },
      {
        path: '/:name/following',
        element: <PrivateRoute element={<Following />}></PrivateRoute>
      },
      {
        path: '/:name/posts',
        element: <PrivateRoute element={<UserPosts />}></PrivateRoute>
      },
      {
        path: '/profile',
        element: <PrivateRoute element={<EditProfile />}></PrivateRoute>
      },
      {
        path: 'search',
        element: <PrivateRoute element={<Search />}></PrivateRoute>
      },
      {
        path: '/:name/:title',
        element: <PrivateRoute element={<Post />}></PrivateRoute>
      },
      {
        path: '/publish',
        element: <PrivateRoute element={<CreatePost />}></PrivateRoute>
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)
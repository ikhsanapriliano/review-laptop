import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from '../layout/Layout'
import Home from '../pages/Home'
import Login from '../pages/Login'
import { GlobalProvider } from '../context/Context'
import ValidateToken from '../middlewares/ValidateToken'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import NeedLogin from '../middlewares/NeedLogin'
import AdminOnly from '../middlewares/AdminOnly'
import Profile from '../pages/Profile'
import Reviews from '../pages/Reviews'
import Review from '../pages/Review'
import ChangePassword from '../pages/ChangePassword'
import NotFound from '../pages/NotFound'

const AppRoutes = () => {
    return (
        <GlobalProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<ValidateToken />}>
                        <Route path='/' element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path='*' element={<NotFound />} />
                            <Route path='/reviews' element={<Reviews />} />
                            <Route path='/review/:id' element={<Review />} />
                            <Route path='/login' element={<Login />} />
                            <Route path='/register' element={<Register />} />
                            <Route element={<NeedLogin />}>
                                <Route path='/profile' element={<Profile />} />
                                <Route path='/change-password' element={<ChangePassword />} />
                                <Route element={<AdminOnly />}>
                                    <Route path='/dashboard' element={<Dashboard />} />
                                </Route>
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </GlobalProvider>
    )
}

export default AppRoutes
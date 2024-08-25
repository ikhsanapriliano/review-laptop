import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "../context/Context"
import axios from "axios"
import SubLoading from "../components/SubLoading"
import { useNavigate } from "react-router-dom"
import Alert from "../components/Alert"

const Profile = () => {
    const { user, baseUrl, isAlert, setIsAlert } = useContext(GlobalContext)
    const accessToken = localStorage.getItem("accessToken")
    const [userProfile, setUserProfile] = useState({})
    const [photo, setPhoto] = useState({
        isHovered: false,
        isClicked: false,
        data: ["photo-1.png", "photo-2.png", "photo-3.png", "photo-4.png"]
    })
    const [action, setAction] = useState("view")
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()
    const [error, setError] = useState({
        isError: false,
        message: ""
    })
    const [isDelete, setIsDelete] = useState(false)

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = () => {
        setIsLoading(true)
        axios.get(`${baseUrl}/api/users/${user.userId}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
            .then((res) => {
                setIsLoading(false)

                setUserProfile({
                    username: res.data.data.username,
                    role: res.data.data.role,
                    firstName: res.data.data.profile.firstName,
                    lastName: res.data.data.profile.lastName,
                    gender: res.data.data.profile.gender,
                    photo: res.data.data.profile.photo,
                    bio: res.data.data.profile.bio,
                })
            })
            .catch((res) => {
                if (res.response.status === 401 || res.response.status === 403) {
                    localStorage.clear()
                    window.location.href = "/login"
                }

                console.log(res)
            })
    }

    const handleUpdate = () => {
        setIsLoading(true)
        setError({
            isError: false,
            message: ""
        })

        axios.patch(`${baseUrl}/api/users/`,
            {
                username: userProfile.username,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                gender: userProfile.gender,
                photo: userProfile.photo,
                bio: userProfile.bio,
            },
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        )
            .then(res => {
                localStorage.setItem("accessToken", res.data.data.accessToken)
                navigate(0)
            })
            .catch(res => {
                if (res.response.status === 401 || res.response.status === 403) {
                    localStorage.clear()
                    window.location.href = "/login"
                }

                setIsLoading(false)
                let message = res.response.data.meta.message
                if (res.response.data.meta.error.includes("duplicate")) {
                    message = "username already taken"
                }

                setError({
                    isError: true,
                    message
                })
            })
    }

    const handleDelete = () => {
        setIsDelete(false)
        setIsLoading(true)

        axios.delete(`${baseUrl}/api/users/${user.userId}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
            .then(() => {
                localStorage.clear()
                navigate(0)
            })
            .catch((res) => {
                if (res.response.status === 401 || res.response.status === 403) {
                    localStorage.clear()
                    window.location.href = "/login"
                }

                setIsAlert(true)
            })
    }

    return (
        <>
            {/* delete failed alert */}
            {isAlert && <Alert action={"Delete Account"} status={"Failed"} />}

            {/* delete popup */}
            {isDelete &&
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center">
                    <div className="bg-white rounded-md shadow-md p-5 flex flex-col">
                        <h3 className="pb-2 border-b text-lg font-bold">Delete Account!</h3>
                        <p className="pb-10 pt-2 border-b">Are you sure you want to delete your account?</p>
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => { setIsDelete(false) }} className="py-1 px-5 rounded-md bg-white border">Cancel</button>
                            <button onClick={() => { handleDelete() }} className="py-1 px-5 rounded-md bg-red-500 hover:bg-red-600 text-white">Delete</button>
                        </div>
                    </div>
                </div>
            }

            {/* main */}
            <section className="flex justify-center py-[30px]">
                {
                    isLoading ?
                        <SubLoading />
                        :
                        <div className="flex flex-col gap-5 justify-center items-center bg-white shadow-md rounded-md p-10 border">
                            <h2 className="font-bold text-lg">Profile</h2>
                            <div onClick={() => { action === "edit" && setPhoto(prev => ({ ...prev, isClicked: !prev.isClicked })) }} onMouseEnter={() => { setPhoto(prev => ({ ...prev, isHovered: true })) }} onMouseLeave={() => { setPhoto(prev => ({ ...prev, isHovered: false })) }} className="w-[150px] h-150px relative">
                                <div className="w-[150px] h-[150px] rounded-full overflow-hidden relative">
                                    <img src={`/img/${userProfile.photo}`} alt="photo" />
                                    {
                                        action === "edit" &&
                                        <div className={`flex justify-center items-center absolute bg-black text-white inset-0 ${photo.isHovered ? "bg-opacity-40" : "bg-opacity-0"} duration-200 cursor-pointer`}>
                                            {photo.isHovered && <p className="font-semibold">Change Photo</p>}
                                        </div>
                                    }
                                </div>
                                {
                                    action === "edit" &&
                                    <div className={`${photo.isHovered ? "bg-gray-300" : "bg-gray-100"} duration-150 cursor-pointer rounded-full overflow-hidden w-10 h-10 flex justify-center items-center shadow-md absolute bottom-0 right-0`}>
                                        <i className="fa-solid fa-pencil"></i>
                                    </div>
                                }
                            </div>
                            {
                                photo.isClicked &&
                                <div className="flex gap-3">
                                    {
                                        photo.data.map((item, index) => (
                                            <div onClick={() => { setUserProfile(prev => ({ ...prev, photo: item })) }} key={index} className="w-[30px] h-[30px] rounded-full overflow-hidden cursor-pointer hover:scale-125 duration-200">
                                                <img src={`/img/${item}`} alt={item} />
                                            </div>
                                        ))
                                    }
                                </div>
                            }
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                    <label htmlFor="username">Username</label>
                                    <input onChange={(e) => { setUserProfile(prev => ({ ...prev, username: e.target.value })) }} value={userProfile.username} className="border px-1" id="username" type="text" disabled={action === "view"} />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="role">Role</label>
                                    <input value={userProfile.role} className="border px-1" id="role" type="text" disabled />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="firstName">First Name</label>
                                    <input onChange={(e) => { setUserProfile(prev => ({ ...prev, firstName: e.target.value })) }} value={userProfile.firstName} className="border px-1" id="firstName" type="text" disabled={action === "view"} />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input onChange={(e) => { setUserProfile(prev => ({ ...prev, lastName: e.target.value })) }} value={userProfile.lastName} className="border px-1" id="lastName" type="text" disabled={action === "view"} />
                                </div>
                                <div className="flex flex-col">
                                    <p>Gender</p>
                                    <div className="flex items-center gap-2">
                                        <input onChange={(e) => { setUserProfile(prev => ({ ...prev, gender: e.target.value })) }} checked={userProfile.gender === "male"} value={"male"} id="male" type="radio" name="gender" disabled={action === "view"} />
                                        <label htmlFor="male">Male</label>
                                        <input onChange={(e) => { setUserProfile(prev => ({ ...prev, gender: e.target.value })) }} checked={userProfile.gender === "female"} value={"female"} id="female" type="radio" name="gender" disabled={action === "view"} />
                                        <label htmlFor="female">Female</label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col w-full">
                                <label htmlFor="bio">Bio</label>
                                <textarea onChange={(e) => { setUserProfile(prev => ({ ...prev, bio: e.target.value })) }} value={userProfile.bio} disabled={action === "view"} id="bio" className="border px-1" rows={3}></textarea>
                                {error.isError && <p className="text-red-600 text-end mt-1">*{error.message}</p>}
                            </div>
                            {
                                action === "view" ?
                                    <div className="w-full flex justify-end gap-3 items-center">
                                        <button onClick={() => { setAction("edit") }} className="py-1 px-5 text-white bg-yellow-500 hover:bg-yellow-600 duration-150 rounded-md">Edit</button>
                                        <button onClick={() => { setIsDelete(true) }} className="py-1 px-5 text-white bg-red-500 hover:bg-red-600 duration-150 rounded-md">Delete</button>
                                    </div>
                                    :
                                    <div className="w-full flex justify-end gap-3 items-center">
                                        <button onClick={() => {
                                            setError({
                                                isError: false,
                                                message: ""
                                            })
                                            setAction("view")
                                            setPhoto(prev => ({ ...prev, isClicked: false }))
                                        }} className="py-1 px-5 text-white bg-red-500 hover:bg-red-600 duration-150 rounded-md">Cancel</button>
                                        <button onClick={() => { handleUpdate() }} className="py-1 px-5 text-white bg-blue-500 hover:bg-blue-600 duration-150 rounded-md">Save</button>
                                    </div>
                            }
                        </div>
                }
            </section>
        </>
    )
}

export default Profile
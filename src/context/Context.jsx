import { createContext, useState } from "react"

export const GlobalContext = createContext()

export const GlobalProvider = props => {
    const [baseUrl] = useState(import.meta.env.VITE_APP_BASE_URL)
    const [vercel] = useState(import.meta.env.VITE_APP_VERCEL_URL)
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState({
        userId: "",
        role: "",
        photo: "",
        isLoggedIn: false
    })
    const [isAlert, setIsAlert] = useState(false)
    const [history, setHistory] = useState("")
    const [brand, setBrand] = useState("")
    const [isSearch, setIsSearch] = useState(false)

    return (
        <GlobalContext.Provider value={{
            baseUrl, vercel,
            isLoading, setIsLoading,
            user, setUser,
            isAlert, setIsAlert,
            history, setHistory,
            brand, setBrand,
            isSearch, setIsSearch
        }}>
            {props.children}
        </GlobalContext.Provider>
    )
}


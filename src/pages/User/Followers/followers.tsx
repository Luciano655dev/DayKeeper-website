import { StyledBody, StyledContainer, StyledLink } from './followersCSS'
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Cookies from 'js-cookie';
import axios from 'axios'
import Page404 from '../../404/Page404'

export default function Followers() {
    const token = Cookies.get('userToken')
    const user = useSelector((state: any) => state.userReducer)
    const { name: userNameFromParams } = useParams()
    const sameUser = userNameFromParams === user.name
    const [followRequests, setFollowRequests]: any = useState([])
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState('')
    const [error, setError] = useState(false)


    useEffect(()=>{
        const getFollowers = async()=>{
            setLoading(true)

            try{
                const response: any = await axios.get(`http://localhost:3000/${userNameFromParams}/followers`, { headers: { Authorization: `Bearer ${token}` } })

                if(
                    !sameUser && (
                        response.data.user.private && // caso a conta seja privada
                        !response.data.user.followers.includes((userId: String) => userId == user.id) // e você não esteja seguindo
                    )
                ) return setError(true)

                console.log(response)

                setFollowRequests(response.data.user.followers || [])
            }catch(err: any){
                console.log(err)
                setError(true)
            }

            setLoading(false)
        }

        getFollowers()
    }, [msg])

    const handleDelete = async(username: String)=>{
        setLoading(true)

        try{
            const response = await axios.delete(`http://localhost:3000/${username}/remove_follow`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setMsg(response.data.msg)
        }catch(err: any){
            console.log(err)
            setError(true)
        }

        setLoading(false)
    }

    if(error) return <Page404></Page404>
    if(loading) return <div>...</div>

    return <StyledBody>
        { msg ? <h1>{msg}</h1> : <></> }
        <h1>Followers: </h1>
        {
            followRequests.map((followReq: any)=>
                <StyledContainer key={followReq.id}>
                    <img src={followReq.profile_picture.url}></img>

                    <StyledLink to={`/${followReq.name}`}>{followReq.name}</StyledLink>

                    { user.private && sameUser ? 
                        <button onClick={()=>handleDelete(followReq.name)}>Delete</button>
                        :
                        <></>
                    }
                </StyledContainer>
            )
        }
    </StyledBody>
}
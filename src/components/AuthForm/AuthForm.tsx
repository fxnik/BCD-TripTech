import React, {FC, useState, useCallback} from 'react'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import { useHttp } from '../../hooks/useHttp'
//import config from 'config'
import axios from "axios";
import { useHistory } from "react-router-dom";

import './authFormStyle.css'

//--------------------------------

const AuthForm: FC = () => {
    //const { isAuthorized } = useTypedSelector(state => state.auth)

    const { setUserIsAuthorizedAction, } = useActions()

    //------------------------------------------------
    let history = useHistory();
    const {request} = useHttp()
    const [isSignIn, setSignIn] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [form, setForm] = useState({email:'', password:'' })
    const [emailIsValid, setEmailValidation] = useState(true)
    const [passwordIsValid, setPasswordValidation] = useState(true)

    //--------------------------------------------------

    const toggleSignInHandler = ()=>{
        setSignIn(state => !state)
    }   

    //--------------------------------------------------    

    const registerHandler = async ()=>{
        if(!form.email){
            alert('Email field is empty. Type your email')
            return
        } else if(!form.password) {
            alert('Password field is empty. Type your password')
            return
        } else if(!emailIsValid || !passwordIsValid ){
            alert('Format of your credentials is invalid')
            return
        }

        try {
           const data = await request('http://127.0.0.1:8000/api/register', 'post', {...form})  
           //const data = await request('http://45.84.226.158:5050/api/register', 'post', {...form})         
           console.log('data= ', data)

           if(data.message === 'user_created') {
               alert('User is created. You may sign in')
           } else if(data.message === 'user_exists'){
               alert('User with such email is already exists')
           }
        } catch(e) {
            throw e 
        }      
    }

    //--------------------------------------------

    const loginHandler = async () => {
        if(!form.email){
            alert('Email field is empty. Type your email')
            return
        } else if(!form.password) {
            alert('Password field is empty. Type your password')
            return
        } else if(!emailIsValid || !passwordIsValid ){
            alert('Format of your credentials is invalid')
            return
        }

        try {
            const data = await request('http://127.0.0.1:8000/api/login', 'post', {...form})
            //const data = await request('http://45.84.226.158:5050/api/login', 'post', {...form})
            console.log('data', data)
            
            if(data.message === 'authorized') {
                localStorage.setItem('userData', JSON.stringify({userId: data.userId, token: data.token }))  
            
                setUserIsAuthorizedAction(true)
                //history.push("/map");
                //let cat = localStorage.getItem('myCat');
            } else if (data.message === 'unauthorized') {
                alert('Unauthorized')
            }        
            
          } catch (e) {
              throw e 
          }
    }

    //-----------------------------------------------------------------

    const changeHandler = ( event: React.ChangeEvent<HTMLInputElement>) =>
    {
        setForm({...form, [event.target.name]: event.target.value})

        if(event.target.name === "email") {
            if(event.target.value.length > 0){
                if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(event.target.value))
                {
                    setEmailValidation(state => true)                
                } 
                else {                
                    setEmailValidation(state => false)
                }     
            }
            else setEmailValidation(state => true)  
        }       

        //----------------------------------------
        
        if(event.target.name === "password") {
            if(event.target.value.length > 0 && (event.target.value.length < 8 || event.target.value.length > 30)) {
                setPasswordValidation(state => false)
             } else setPasswordValidation(state => true)
        }         
    }

    //--------------------------------------------

    return (
        <div className="a__auth-form-container">
            <div className="a__auth-form">                
                {isSignIn ? 
                  <span>Sign in</span>
                  :
                  <span>Sign up</span>            
                }

                <div className="a__email">
                    <span>Email</span>
                    <input type="text" 
                           placeholder="type your email" 
                           name="email"
                           value={form.email}
                           onChange={changeHandler}                           
                           className={emailIsValid ? "": "a__invalid"}                          
                    />
                </div>

                <div className="a__password">
                    <span>Password</span>
                    <input type="password" 
                           placeholder="type your password as 8-30 symbols" 
                           name="password"
                           value={form.password}
                           onChange={changeHandler}                           
                           className={passwordIsValid ? "": "a__invalid"}                      
                    />
                </div> 

                <div className="a__buttons">
                    {isSignIn ? 
                        <>
                            <span className="a__sign-btn" onClick={toggleSignInHandler}>
                                Sign up
                            </span>
                            <span className="a__sign-submit-btn" onClick={loginHandler}>
                                Submit
                            </span>
                        </>
                        :
                        <>
                            <span className="a__sign-btn" onClick={toggleSignInHandler}>
                                Sign in
                            </span>
                            <span className="a__sign-submit-btn" onClick={registerHandler}>
                                Submit
                            </span>
                        </>
                    }
                    
                </div>
                
             </div>
        </div>
    )
}

export default AuthForm

import React, {FC, useState, useCallback} from 'react'
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useActions } from '../../hooks/useActions';
import { useHttp } from '../../hooks/useHttp'
//import config from 'config'
//import axios from "axios";
import { useHistory } from "react-router-dom";

import './authFormStyle.css'

//--------------------------------

const AuthForm: FC = () => {
    const { setUserIsAuthorizedAction, } = useActions()

    //------------------------------------------------

    let history = useHistory();
    const {request} = useHttp()
    const [isSignIn, setSignIn] = useState(true)
    const [inProgress, setInProgress] = useState(false)
    //const [error, setError] = useState(null)
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
            alert('Поле Email пустое. Введите свой email')
            return
        } else if(!form.password) {
            alert('Поле Password пустое. Введите свой пароль')
            return
        } else if(!emailIsValid || !passwordIsValid ){
            alert('Неправильный формат введенных данных')
            return
        }

        try {
           setInProgress(state => true)

           const data = await request('http://127.0.0.1:8000/api/register', 'post', {...form})  
           //const data = await request('http://45.84.226.158:5050/api/register', 'post', {...form})         
           console.log('data= ', data)

           if(data.isError){
               setInProgress(state => false)
               alert('Error: ' + data.message)
           } else if(data.message === 'user_created') {
               setInProgress(state => false)
               alert('Пользователь создан. Вы можете войти')
           } else if(data.message === 'user_exists'){
               setInProgress(state => false)
               alert('Введите другой email')
           }
        } catch(e) {
            setInProgress(state => false)
            alert('Error: ' + e.message)
            throw e 
        }      
    }

    //--------------------------------------------

    const loginHandler = async () => {
        if(!form.email){
            alert('Поле Email пустое. Введите свой email')
            return
        } else if(!form.password) {
            alert('Поле Password пустое. Введите свой пароль')
            return
        } else if(!emailIsValid || !passwordIsValid ){
            alert('Неправильный формат введенных данных')
            return
        }

        try {
            setInProgress(state => true)

            const data = await request('http://127.0.0.1:8000/api/login', 'post', {...form})
            //const data = await request('http://45.84.226.158:5050/api/login', 'post', {...form})
            console.log('data', data)

            if(data.isError){
               setInProgress(state => false)
               alert('Error: ' + data.message)
            } else if(data.message === 'authorized') {
                setInProgress(state => false)
                localStorage.setItem('userData', JSON.stringify({userId: data.userId, token: data.token }))  
            
                setUserIsAuthorizedAction(true)
                //history.push("/map");                
            } else if (data.message === 'unauthorized') {
                setInProgress(state => false)
                alert('Вы не прошли авторизацию')
            }        
            
          } catch (e) {
              setInProgress(state => false)
              alert('Error: ' + e.message)
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
                           placeholder="введите email" 
                           name="email"
                           value={form.email}
                           onChange={changeHandler}                           
                           className={emailIsValid ? "": "a__invalid"}                          
                    />
                </div>

                <div className="a__password">
                    <span>Password</span>
                    <input type="password" 
                           placeholder="введите пароль в виде 8-30 символов" 
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

                <div className={inProgress ? "a__spinner": "a__spinner a__disabled"}> 
                   <div>Ждите</div>               
                   <div className="a__lds-dual-ring-auth"></div> 
                </div>
                
             </div>
        </div>
    )
}

export default AuthForm

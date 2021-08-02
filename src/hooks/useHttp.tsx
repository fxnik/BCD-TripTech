import React, {useCallback}  from 'react'
import axios from 'axios'

export const useHttp = () => {


    const request = useCallback(async (url, method = 'get', body = null, headers = {}) => 
    {
      try {
          if(body) {
              body = JSON.stringify(body)
              headers['Content-Type'] = 'application/json'
              headers["Accept"] = 'application/json'
          }         

          const response = await axios({
             method: method,
             url: url,
             headers: headers,
             data: body,
             //timeout: 5000
          })

          console.log("response= ",response);                                      

          if(response.status !== 200)
          {
             throw new Error(response.statusText)
          }     

          return response.data
       } catch(e) {         
           console.log('error', e.message)
           throw e
       }
   }, []) 


   return{ request }
}



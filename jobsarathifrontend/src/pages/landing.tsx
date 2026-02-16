import { useState , useEffect } from "react";
import axios from "axios";



export default function Landing(){

  const [message, setMessage] = useState("")

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/hello/")
      .then(response => {
        setMessage(response.data.message)
      })
  }, [])

  return <h1>{message}</h1>


}


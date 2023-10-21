import api from "../../axiosInstance"
var flag = true;

const callProfilePage = async () => {
    
    try {
      const res = await api('/about' ,{
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type":"application/json"
        },
        credentials:"include"
      } );
     
    
      if(!res.status === 200){
        const error = new Error(res.error);
        throw error;
        flag = null;
        
      }
    
    
    } catch (err) {
      console.log(err);
    flag = null;
    }
    
      }

      callProfilePage();

      export const initialState = flag;



export const reducer = (state , action) => {

if(action.type === "USER"){
    return action.payload;
}

return state;


}
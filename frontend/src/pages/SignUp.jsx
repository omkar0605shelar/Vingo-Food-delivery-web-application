import { useState } from 'react';
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {auth} from '../../firebase'
import { ClipLoader } from 'react-spinners'

function SignUp() {
  const primaryColor = '#ff4d2d';
  const bgColor = '#fff9f6';
  const borderColor = '#ddd';
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signup`,{
        fullName, email, password, mobile, role
      },
      {
        withCredentials: true,
      });

      console.log("Signup success:", result);
      setErr('');
      setLoading(false);
    } 
    catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if(!mobile){
      return setErr("mobile no is required");
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return alert("Please enter a valid 10-digit mobile number");
    }

    const provider = new GoogleAuthProvider();
    const result= await signInWithPopup(auth, provider);
    try{
      const {data} = await axios.post(`${serverUrl}/api/auth/google-auth`, {
        fullName:result.user.displayName,
        email:result.user.email,
        role,
        mobile
      })

      console.log(data);
    }
    catch(error){
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center w-full p-4" style={{ backgroundColor: bgColor }}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8" style={{ border: `1px solid ${borderColor}` }}>
        <h1 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>Vingo</h1>
        <p className="text-gray-600 mb-8">Create your account to get started with delicious food deliveries.</p>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Full Name</label>
          <input
            onChange={(e) => {
              setFullName(e.target.value);
            }}
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter your full name"
            style={{ border: `1px solid ${borderColor}` }}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter your email"
            style={{ border: `1px solid ${borderColor}` }}
            required
          />
        </div>

        {/* Mobile */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Mobile</label>
          <input
            onChange={(e) => {
              setMobile(e.target.value);
            }}
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter your mobile number"
            style={{ border: `1px solid ${borderColor}` }}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <label className="block text-gray-700 font-medium mb-1">Password</label>
          <input
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type={showPassword ? "text" : "password"}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter your password"
            style={{ border: `1px solid ${borderColor}` }}
            required
          />
          <button
            type="button"
            onClick={() => 
              setShowPassword(!showPassword)
            }
            className="absolute right-3 top-10 text-gray-500 cursor-pointer"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Role */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Role</label>
          <div className="flex gap-2">
            {['user', 'deliveryBoy', 'owner'].map((r) => (
              <button
                key={r}
                type="button"
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors hover:bg-orange-100 cursor-pointer"
                onClick={() => setRole(r)}
                style={
                  role === r
                    ? { backgroundColor: primaryColor, color: "white" }
                    : { border: `1px solid ${borderColor}`, color: "#333" }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignUp}
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg py-2 px-4 transition duration-200 text-white cursor-pointer hover:bg-[#e64323]"
          style={{ backgroundColor: primaryColor }}
          disabled={loading}
        >
          { loading ? <ClipLoader size={20} /> : 'Sign Up'}
        </button>

        {err && <p className='text-red-500 text-center my-[10px]'>{err}</p>}

        <button className="w-full mt-4 flex items-center justify-center gap-2 border-2 rounded-lg px-4 py-2 transition duration-200 border-gray-200 hover:bg-gray-200 cursor-pointer" onClick={handleGoogleAuth}> 
          <FcGoogle size={20} />
          <span>Sign Up with Google</span>
        </button>

        <p className="text-center mt-6 cursor-pointer" onClick={() => navigate('/signin')}>
          Already have an account? <span className="text-[#ff4d2d]">Sign in</span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;

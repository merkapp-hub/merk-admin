import Alert from "@mui/material/Alert";

export default function Toaster(props) {
  return (
    <Alert 
      className="!z-[999999]" 
      severity={props.type}
      sx={{ 
        backgroundColor: '#12344D',
        color: 'white',
        '& .MuiAlert-icon': {
          color: 'white'
        }
      }}
    >
      <p className="text-white font-semibold">{props.message}</p>
    </Alert>
  );
}

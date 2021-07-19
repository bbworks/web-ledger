import {useEffect} from 'react';

const useConsoleLog = (object, ...args)=>{
  return useEffect(()=>console.log(args[0], object, ...args.slice(1)), [object])
};

export default useConsoleLog;

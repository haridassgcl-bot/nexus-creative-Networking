import { Request,Response,NextFunction } from 'express';
export type Role='CUSTOMER'|'ENGINEER'|'ADMIN';
declare global { namespace Express { interface Request { user?:{id:string;role:Role} } } }
// Replace this development header adapter with verified JWT middleware before production.
export function devAuth(req:Request,_res:Response,next:NextFunction){
  const id=req.header('x-user-id'); const role=req.header('x-user-role') as Role;
  if(id && ['CUSTOMER','ENGINEER','ADMIN'].includes(role)) req.user={id,role};
  next();
}
export function requireRole(...roles:Role[]){return (req:Request,res:Response,next:NextFunction)=>{if(!req.user || !roles.includes(req.user.role)) return res.status(403).json({error:'FORBIDDEN'}); next();};}

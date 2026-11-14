import {Router} from 'express'; import {prisma} from '../db'; import {requireRole} from '../middleware/auth'; import {dispatchJob} from '../services/matching';
const router=Router(); router.use(requireRole('ADMIN'));
router.get('/dashboard',async(_req,res)=>{const [customers,engineers,pending,openJobs,completed]=await Promise.all([prisma.user.count({where:{role:'CUSTOMER'}}),prisma.engineerProfile.count({where:{status:'VERIFIED'}}),prisma.engineerProfile.count({where:{status:'PENDING'}}),prisma.job.count({where:{status:{in:['REQUESTED','MATCHING','OFFERED','ASSIGNED','ACCEPTED','EN_ROUTE','IN_PROGRESS']}}}),prisma.job.count({where:{status:'COMPLETED'}})]);res.json({customers,verifiedEngineers:engineers,pendingVerification:pending,openJobs,completedJobs:completed});});
router.get('/jobs',async(_req,res)=>res.json(await prisma.job.findMany({include:{items:true,assignment:true},orderBy:{requestedAt:'desc'},take:100})));
router.post('/jobs/:id/redispatch',async(req,res)=>{try{res.json(await dispatchJob(req.params.id));}catch(e:any){res.status(400).json({error:e.message});}});
router.patch('/engineers/:id/verify',async(req,res)=>{const p=await prisma.engineerProfile.update({where:{id:req.params.id},data:{status:'VERIFIED',verifiedAt:new Date()}});res.json(p);});
export default router;

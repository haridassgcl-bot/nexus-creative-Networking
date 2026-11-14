import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { dispatchJob,findMatches } from '../services/matching';
import { requireRole } from '../middleware/auth';
const router=Router();
const createSchema=z.object({mode:z.enum(['REMOTE','ONSITE','BOTH']),latitude:z.number(),longitude:z.number(),address:z.string().optional(),customerNotes:z.string().max(3000).optional(),items:z.array(z.object({serviceId:z.string(),quantity:z.number().int().min(1).max(20)})).min(1)});
router.post('/',requireRole('CUSTOMER'),async(req,res)=>{
 try {const input=createSchema.parse(req.body); const services=await prisma.service.findMany({where:{id:{in:input.items.map(i=>i.serviceId)},active:true}}); if(services.length!==new Set(input.items.map(i=>i.serviceId)).size) return res.status(400).json({error:'INVALID_SERVICE'});
 const total=input.items.reduce((sum,i)=>sum+(services.find(s=>s.id===i.serviceId)!.basePrice*i.quantity),0);
 const job=await prisma.job.create({data:{customerId:req.user!.id,mode:input.mode,latitude:input.latitude,longitude:input.longitude,address:input.address,customerNotes:input.customerNotes,quotedTotal:total,searchRadiusKm:10,items:{create:input.items.map(i=>({serviceId:i.serviceId,quantity:i.quantity,titleSnapshot:services.find(s=>s.id===i.serviceId)!.title,unitPriceSnapshot:services.find(s=>s.id===i.serviceId)!.basePrice}))},events:{create:{status:'REQUESTED',note:'Customer submitted task'}}}});
 const dispatch=await dispatchJob(job.id); res.status(201).json({job,dispatch});
 } catch(e:any){res.status(400).json({error:e.message||'INVALID_REQUEST'});}
});
router.get('/:id',async(req,res)=>{const job=await prisma.job.findUnique({where:{id:req.params.id},include:{items:true,events:{orderBy:{createdAt:'asc'}},assignment:true}}); if(!job)return res.status(404).json({error:'NOT_FOUND'}); if(req.user?.role==='CUSTOMER'&&job.customerId!==req.user.id)return res.sendStatus(403); res.json(job);});
router.get('/:id/matches',requireRole('ADMIN'),async(req,res)=>{try{res.json(await findMatches(req.params.id,Number(req.query.radius)||10));}catch(e:any){res.status(400).json({error:e.message});}});
export default router;

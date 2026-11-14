import { prisma } from '../db';

export function distanceKm(aLat:number,aLng:number,bLat:number,bLng:number):number {
  const rad=(v:number)=>v*Math.PI/180;
  const dLat=rad(bLat-aLat), dLng=rad(bLng-aLng);
  const h=Math.sin(dLat/2)**2+Math.cos(rad(aLat))*Math.cos(rad(bLat))*Math.sin(dLng/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}

export async function findMatches(jobId:string, radiusKm=10) {
  const job=await prisma.job.findUnique({where:{id:jobId},include:{items:{include:{service:{include:{requiredSkills:{include:{skill:true}}}}}}}});
  if(!job) throw new Error('JOB_NOT_FOUND');
  const required=[...new Map(job.items.flatMap(i=>i.service.requiredSkills.filter(s=>s.required).map(s=>[s.skillId,s]))).values()];
  const engineers=await prisma.engineerProfile.findMany({
    where:{status:'VERIFIED',availability:'ONLINE',latitude:{not:null},longitude:{not:null}},
    include:{skills:{include:{skill:true}},locations:{orderBy:{recordedAt:'desc'},take:1}}
  });
  const candidates=engineers.map(e=>{
    const loc=e.locations[0]; const lat=loc?.latitude ?? e.latitude!; const lng=loc?.longitude ?? e.longitude!;
    const distance=distanceKm(job.latitude,job.longitude,lat,lng);
    const skillsOk=required.every(r=>e.skills.some(s=>s.skillId===r.skillId && s.proficiency>=r.minimumProficiency && s.verified));
    const matched=required.filter(r=>e.skills.some(s=>s.skillId===r.skillId && s.proficiency>=r.minimumProficiency && s.verified)).length;
    const skillScore=required.length?matched/required.length:1;
    const distanceScore=Math.max(0,1-distance/radiusKm);
    const ratingScore=Math.min(1,e.rating/5);
    const experienceScore=Math.min(1,e.experienceYears/10);
    const availabilityScore=1;
    const score=(skillScore*35)+(distanceScore*25)+(availabilityScore*15)+(ratingScore*10)+(experienceScore*10)+5;
    return {engineer:e,distanceKm:Number(distance.toFixed(2)),score:Number(score.toFixed(2)),skillsOk};
  }).filter(c=>c.skillsOk && c.distanceKm<=radiusKm).sort((a,b)=>b.score-a.score);
  return candidates;
}

export async function dispatchJob(jobId:string) {
  const job=await prisma.job.findUnique({where:{id:jobId}});
  if(!job) throw new Error('JOB_NOT_FOUND');
  const radius=job.searchRadiusKm || 10;
  const matches=await findMatches(jobId,radius);
  if(!matches.length) return {radiusKm:radius,matches:[],expanded:false};
  const batch=matches.slice(0,3);
  const now=new Date();
  await prisma.$transaction([
    prisma.job.update({where:{id:jobId},data:{status:'OFFERED'}}),
    ...batch.map(m=>prisma.jobOffer.upsert({where:{jobId_engineerId:{jobId,engineerId:m.engineer.id}},create:{jobId,engineerId:m.engineer.id,matchScore:m.score,distanceKm:m.distanceKm,expiresAt:new Date(now.getTime()+30_000)},update:{status:'SENT',matchScore:m.score,distanceKm:m.distanceKm,sentAt:now,expiresAt:new Date(now.getTime()+30_000)}}))
  ]);
  return {radiusKm:radius,matches:batch.map(m=>({engineerId:m.engineer.id,name:m.engineer.userId,score:m.score,distanceKm:m.distanceKm})),expanded:false};
}

import 'dotenv/config';
const QUEUE_ENGINE_URL = process.env.QUEUE_ENGINE_URL || 'http://localhost:5000';

const call = async(method,path,body=null)=>{
    const options = {
        method,
        headers:{'Content-Type':application/layer},
    }
    if(body) options.body = JSON.stringify(body);
    const res = await fetch(`${QUEUE_ENGINE_URL}${path}`,options);
    const data = await res.json();
    if(!res.ok){
        const err = new Error(data.error || 'Queue engine error');
        err.status=res.status;
        throw err;
    }
    return data;
}

export const joinPreQueue = (providerId,userId)=>
    call('POST','/queue/join',{providerId,userId});


export const shuffleQueue = (providerId) =>
  call('POST', '/queue/shuffle', { providerId });

export const joinLate = (providerId, userId) =>
  call('POST', '/queue/join-late', { providerId, userId });

export const getQueuePosition = (providerId, userId) =>
  call('GET', `/queue/position/${providerId}/${userId}`);

export const checkEligible = (providerId, userId) =>
  call('GET', `/queue/eligible/${providerId}/${userId}`);

export const removeFromQueue = (providerId, userId) =>
  call('DELETE', '/queue/remove', { providerId, userId });
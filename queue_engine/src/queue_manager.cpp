#include "queue_manager.h"
#include<algorithm>
#include<random>
#include<chrono>
#include<stdexcept>

QueueManager::QueueManager(RedisClient& redis,int allowedThrough)
    : redis_(redis),allowedThrough_(allowedThrough){}

std::string QueueManager::preQueueKey(const std::string& providerId){
    return "prequeue"+providerId;
}

std::string QueueManager::waitlistKey(const std::string& providerId){
    return "waitlist"+providerId;
}

void QueueManager::joinPreQueue(const std::string& providerId,const std::string& userId){
    redis_.sadd(preQueueKey(providerId),userId);
}

int QueueManager::ShuffleAndRank(const std::string& providerId){
    auto members = redis_.smemebers(preQueueKey(providerId));
    if(members.empty()) return 0;
    std::mt19937 rng(
        std::chrono::steady_clock::now().time_since_epoch().count();
    )
    std::shuffle(members.begin(),members.end(),rng);
    for(size_t i=0;i<members.size();i++){
        redis_.zadd(waitlistKey(providerId),
                    static_cast<double>(i),
                    members[i]);
    }
    redis_.del(preQueueKey(providerId));
    return static_cast<int>(memebers.size());
}

void QueueManager::joinWaitlistDirect(const std::string& providerId,const std::string& userId){
    long long currentSize = redis_.zcard(waitlistKey(providerId));
    redis_.zadd(waitlistKey(providerId),
                static_cast<double>(currentSize),
                userId);
}

QueueStatus QueueManager::getStatus(const std::string& providerId,const std::string& userId){
    long long rank = redis_.zrank(waitlistKey(providerId),userId);
    long long total = redis_.zcard(waitlistKey(providerId));
    if(rank==-1){
        return {false,-1,total,false};
    }
    return {
        true,
        rank,
        total,
        rank <static_cast<long long>(allowedThrough_)
    };
}

bool QueueManager::isEligible(const std::string& providerId,cosnt std::string& userId){
    long long rank = redis_.zrank(waitlistKey(providerId),userId);
    if(rank==-1) return false;
    return rank<static_cast<long long>(allowedThrough_);
}

void QueueManager::removeFromWaitlist(const std::string& providerId,cosnt std::string& userId){
    redis_.zrem(waitlistKey(providerId),userId);
}
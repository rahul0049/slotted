#pragma once 
#include "redis_client.h"
#include<string>

struct QueueStatus{
    bool inQueue;
    long long position ;
    long long totalSize;
    bool eligible;
}

class QueueManager{
public:
    explicit QueueManager(RedisClient& redis, int allowedThrough);
    void joinPreQueue(const std::string& providerId, const::string& userId);
    void ShuffleAndRank(const std::string& providerId);
    void joinWaitlistDirect(const std::string& providerId, const std::string& userId);
    QueueStatus getStatus(const std::string& providerId, const std::string& userID);
    bool isEligible(const std::string& providerId,const std::string& userId);
    void removeFromWaitlist(const std::string& providerId, const std::string& userId);

private:
    RedisClient& redis;
    int allowedThrough_;
    std::string& preQueueKey(cosnt std::string& providerId);
    std::string& waitlistKey(const std::string& providerId);
}
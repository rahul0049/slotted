#include "queue_manager.h"
#include <sw/redis++/redis++.h>
#include <algorithm>
#include <random>
#include <chrono>
#include <vector>
#include <string>

using namespace sw::redis;

void joinPreQueue(Redis& redis, const std::string& providerId,
                  const std::string& userId) {
    redis.sadd("prequeue:" + providerId, userId);
}

int shuffleAndRank(Redis& redis, const std::string& providerId) {
    std::vector<std::string> members;
    redis.smembers("prequeue:" + providerId,
                   std::back_inserter(members));

    if (members.empty()) return 0;
    std::mt19937 rng(
        std::chrono::steady_clock::now().time_since_epoch().count()
    );
    std::shuffle(members.begin(), members.end(), rng);
    std::vector<std::pair<std::string, double>> scoreMembers;
    for (size_t i = 0; i < members.size(); ++i) {
        scoreMembers.emplace_back(members[i], static_cast<double>(i));
    }
    redis.zadd("waitlist:" + providerId,
               scoreMembers.begin(), scoreMembers.end());
    redis.del("prequeue:" + providerId);

    return static_cast<int>(members.size());
}

void joinLate(Redis& redis, const std::string& providerId,
              const std::string& userId) {
    long long currentSize = redis.zcard("waitlist:" + providerId);
    redis.zadd("waitlist:" + providerId,
               userId,static_cast<double>(currentSize));
}

long long getPosition(Redis& redis, const std::string& providerId,
                      const std::string& userId) {
    auto rank = redis.zrank("waitlist:" + providerId, userId);
    return rank ? *rank : -1;
}

bool isEligible(Redis& redis, const std::string& providerId,
                const std::string& userId, int allowedThrough) {
    long long pos = getPosition(redis, providerId, userId);
    if (pos == -1) return false;
    return pos < static_cast<long long>(allowedThrough);
}

void removeFromWaitlist(Redis& redis, const std::string& providerId,
                        const std::string& userId) {
    redis.zrem("waitlist:" + providerId, userId);
}
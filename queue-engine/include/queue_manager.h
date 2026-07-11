#pragma once
#include <sw/redis++/redis++.h>
#include <string>

using namespace sw::redis;

void joinPreQueue(Redis& redis, const std::string& providerId,
                  const std::string& userId);

int shuffleAndRank(Redis& redis, const std::string& providerId);

void joinLate(Redis& redis, const std::string& providerId,
              const std::string& userId);

long long getPosition(Redis& redis, const std::string& providerId,
                      const std::string& userId);

bool isEligible(Redis& redis, const std::string& providerId,
                const std::string& userId, int allowedThrough);

void removeFromWaitlist(Redis& redis, const std::string& providerId,
                        const std::string& userId);
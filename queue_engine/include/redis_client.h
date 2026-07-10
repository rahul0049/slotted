#pragma once
#include <hiredis/hiredis.h>
#include <string>
#include <vector>
#include <stdexcept>

class RedisClient {
public:
    explicit RedisClient(const std::string& host, int port);
    ~RedisClient();
    void set(const std::string& key, const std::string& value);
    std::string get(const std::string& key);
    void del(const std::string& key);

    void sadd(const std::string& key, const std::string& member);
    std::vector<std::string> smembers(const std::string& key);

    void zadd(const std::string& key, double score, const std::string& member);
    long long zrank(const std::string& key, const std::string& member);
    long long zcard(const std::string& key);
    void zrem(const std::string& key, const std::string& member);

    bool exists(const std::string& key);

private:
    redisContext* ctx_;
    void checkReply(redisReply* reply, const std::string& cmd);
};
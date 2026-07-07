#pragma once 
#include <hiredis/hiredis.h>
#include <string>
#include <vector>
#include <stdexcept>

class RedisClient {
    public:
    explicit RedisClient(const std::string& host,int port);
    ~RedisClient();

    void set(const std::string& key,const std::string& value);
    std::string get(const std::string& key);
    void del(const std::string& key);

    void sadd(const std::string& key,const std::string& memeber);
    long long zrank(const std::string& key,const std::string& member);
    long long zcard(const std::string& key);
    void zrem(const std::string& key,const std::string& member);
    bool exits(const std::string& key);

private:
    redisContext* ctx_;
    void checkReply(redisReply* reply, const std::string& cmd);
};
#include "redis_client.h"
#include <stdexcept>
#include <cstring>

RedisClient::RedisClient(const std::string& host, int port) {
    ctx_ = redisConnect(host.c_str(), port);
    if (!ctx_ || ctx_->err) {
        std::string msg = ctx_ ? ctx_->errstr : "Can't allocate redis context";
        throw std::runtime_error("Redis connection failed: " + msg);
    }
}

RedisClient::~RedisClient() {
    if (ctx_) redisFree(ctx_);
}

void RedisClient::checkReply(redisReply* reply, const std::string& cmd) {
    if (!reply) throw std::runtime_error(cmd + ": null reply from Redis");
    if (reply->type == REDIS_REPLY_ERROR) {
        std::string err(reply->str);
        freeReplyObject(reply);
        throw std::runtime_error(cmd + " error: " + err);
    }
}

void RedisClient::set(const std::string& key, const std::string& value) {
    auto* reply = (redisReply*)redisCommand(ctx_, "SET %s %s", key.c_str(), value.c_str());
    checkReply(reply, "SET");
    freeReplyObject(reply);
}

std::string RedisClient::get(const std::string& key) {
    auto* reply = (redisReply*)redisCommand(ctx_, "GET %s", key.c_str());
    checkReply(reply, "GET");
    std::string result = (reply->type == REDIS_REPLY_NIL) ? "" : std::string(reply->str);
    freeReplyObject(reply);
    return result;
}

void RedisClient::del(const std::string& key) {
    auto* reply = (redisReply*)redisCommand(ctx_, "DEL %s", key.c_str());
    checkReply(reply, "DEL");
    freeReplyObject(reply);
}

void RedisClient::sadd(const std::string& key, const std::string& member) {
    auto* reply = (redisReply*)redisCommand(ctx_, "SADD %s %s", key.c_str(), member.c_str());
    checkReply(reply, "SADD");
    freeReplyObject(reply);
}

std::vector<std::string> RedisClient::smembers(const std::string& key) {
    auto* reply = (redisReply*)redisCommand(ctx_, "SMEMBERS %s", key.c_str());
    checkReply(reply, "SMEMBERS");
    std::vector<std::string> result;
    for (size_t i = 0; i < reply->elements; ++i) {
        result.emplace_back(reply->element[i]->str);
    }
    freeReplyObject(reply);
    return result;
}

void RedisClient::zadd(const std::string& key, double score, const std::string& member) {
    auto* reply = (redisReply*)redisCommand(ctx_, "ZADD %s %f %s",
        key.c_str(), score, member.c_str());
    checkReply(reply, "ZADD");
    freeReplyObject(reply);
}

long long RedisClient::zrank(const std::string& key, const std::string& member) {
    auto* reply = (redisReply*)redisCommand(ctx_, "ZRANK %s %s",
        key.c_str(), member.c_str());
    checkReply(reply, "ZRANK");
    long long result = (reply->type == REDIS_REPLY_NIL) ? -1 : reply->integer;
    freeReplyObject(reply);
    return result;
}

long long RedisClient::zcard(const std::string& key) {
    auto* reply = (redisReply*)redisCommand(ctx_, "ZCARD %s", key.c_str());
    checkReply(reply, "ZCARD");
    long long result = reply->integer;
    freeReplyObject(reply);
    return result;
}

void RedisClient::zrem(const std::string& key, const std::string& member) {
    auto* reply = (redisReply*)redisCommand(ctx_, "ZREM %s %s",
        key.c_str(), member.c_str());
    checkReply(reply, "ZREM");
    freeReplyObject(reply);
}

bool RedisClient::exists(const std::string& key) {
    auto* reply = (redisReply*)redisCommand(ctx_, "EXISTS %s", key.c_str());
    checkReply(reply, "EXISTS");
    bool result = reply->integer > 0;
    freeReplyObject(reply);
    return result;
}
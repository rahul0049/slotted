#include "crow.h"
#include "queue_manager.h"
#include <sw/redis++/redis++.h>
#include <cstdlib>
#include <iostream>

using namespace sw::redis;

int main() {
    std::string redisUrl  = std::getenv("REDIS_URL")
                            ? std::getenv("REDIS_URL")
                            : "tcp://127.0.0.1:6379";
    int allowedThrough    = std::getenv("QUEUE_ALLOWED_THROUGH")
                            ? std::stoi(std::getenv("QUEUE_ALLOWED_THROUGH"))
                            : 1000;
    int port              = std::getenv("QUEUE_ENGINE_PORT")
                            ? std::stoi(std::getenv("QUEUE_ENGINE_PORT"))
                            : 5000;

    Redis redis(redisUrl);
    std::cout << "Connected to Redis\n";

    crow::SimpleApp app;
    CROW_ROUTE(app, "/queue/join").methods(crow::HTTPMethod::POST)
    ([&redis](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("providerId") || !body.has("userId")) {
            return crow::response(400, R"({"error":"providerId and userId required"})");
        }
        try {
            joinPreQueue(redis, body["providerId"].s(), body["userId"].s());
            crow::json::wvalue res;
            res["joined"] = true;
            return crow::response(200, res);
        } catch (const std::exception& e) {
            return crow::response(500, std::string(e.what()));
        }
    });

    CROW_ROUTE(app, "/queue/shuffle").methods(crow::HTTPMethod::POST)
    ([&redis](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("providerId")) {
            return crow::response(400, R"({"error":"providerId required"})");
        }
        try {
            int count = shuffleAndRank(redis, body["providerId"].s());
            crow::json::wvalue res;
            res["shuffled"]    = true;
            res["usersRanked"] = count;
            return crow::response(200, res);
        } catch (const std::exception& e) {
            return crow::response(500, std::string(e.what()));
        }
    });


    CROW_ROUTE(app, "/queue/join-late").methods(crow::HTTPMethod::POST)
    ([&redis](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("providerId") || !body.has("userId")) {
            return crow::response(400, R"({"error":"providerId and userId required"})");
        }
        try {
            joinLate(redis, body["providerId"].s(), body["userId"].s());
            crow::json::wvalue res;
            res["joined"] = true;
            return crow::response(200, res);
        } catch (const std::exception& e) {
            return crow::response(500, std::string(e.what()));
        }
    });

    CROW_ROUTE(app, "/queue/position/<string>/<string>")
    ([&redis, &allowedThrough](const std::string& providerId,
                               const std::string& userId) {
        try {
            long long pos   = getPosition(redis, providerId, userId);
            long long total = redis.zcard("waitlist:" + providerId);
            bool eligible   = pos != -1 &&
                              pos < static_cast<long long>(allowedThrough);
            long long aheadOfThreshold = std::max(0LL, pos - static_cast<long long>(allowedThrough));
            long long estimatedWaitMins = (aheadOfThreshold * 30) / 60;
            crow::json::wvalue res;
            res["position"]  = pos;      
            res["total"]     = total;
            res["eligible"]  = eligible;
            res["estimatedWaitMins"]=estimatedWaitMins;
            return crow::response(200, res);
        } catch (const std::exception& e) {
            return crow::response(500, std::string(e.what()));
        }
    });

    CROW_ROUTE(app, "/queue/eligible/<string>/<string>")
    ([&redis, &allowedThrough](const std::string& providerId,
                               const std::string& userId) {
        try {
            bool eligible = isEligible(redis, providerId, userId, allowedThrough);
            crow::json::wvalue res;
            res["eligible"] = eligible;
            return crow::response(200, res);
        } catch (const std::exception& e) {
            return crow::response(500, std::string(e.what()));
        }
    });

    CROW_ROUTE(app, "/queue/remove").methods(crow::HTTPMethod::DELETE)
    ([&redis](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("providerId") || !body.has("userId")) {
            return crow::response(400, R"({"error":"providerId and userId required"})");
        }
        try {
            removeFromWaitlist(redis, body["providerId"].s(), body["userId"].s());
            crow::json::wvalue res;
            res["removed"] = true;
            return crow::response(200, res);
        } catch (const std::exception& e) {
            return crow::response(500, std::string(e.what()));
        }
    });

    std::cout << "Queue engine running on port " << port << "\n";
    app.port(port).multithreaded().run();
    return 0;
}
#include "crow.h"
#include "queue_manager.h"
#include "redis_client.h"
#include<memory>
#include<cstdlib>

void registerRoutes(crow::SimpleApp& app,QueueManager& qm,RedisClient& redis){
    CROW_ROUTE(app,"/queue/join").methods(crow::HTTPMethod::POST)
    ([&qm]) (const crow::request& req){
        auto body = crow::json::load(req.body);
        if(!body|| !body.has("providerId") || !body.has("userId")){
            return crow::response(400,R"({"error":"providerId and userId required"})");
        }
        std::string providerId=body["providerId"].s();
        std::string userId = body["userId"].s();
        try
        {
            qm.joinPreQueue(providerId,userId);
            crow::json::wvalue res;
            res["joined"]=true;
            res["providerId"]=providerId;
            return crow::response(200,res);
        }
        catch(const std::exception& e)
        {
            return crow::response(500,std::string(e.what()));
        }
        
    }
}
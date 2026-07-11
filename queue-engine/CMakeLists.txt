cmake_minimum_required(VERSION 3.16)
project(queue_engine)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Crow HTTP framework
include(FetchContent)
FetchContent_Declare(
  crow
  GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
  GIT_TAG        v1.2.0
)
set(CROW_USE_BOOST OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(crow)

find_library(HIREDIS_LIB hiredis REQUIRED)

find_library(REDIS_PLUS_PLUS_LIB redis++ REQUIRED)
find_path(REDIS_PLUS_PLUS_INCLUDE sw/redis++/redis++.h REQUIRED)

add_executable(queue_engine
  src/main.cpp
  src/queue_manager.cpp
)

target_include_directories(queue_engine PRIVATE
  include
  ${REDIS_PLUS_PLUS_INCLUDE}
)

target_link_libraries(queue_engine PRIVATE
  ${HIREDIS_LIB}
  ${REDIS_PLUS_PLUS_LIB}
  Crow::Crow
)
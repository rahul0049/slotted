cmake_minimum_required(VERSION 3.16)
project(queue_engine)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_library(HIREDIS_LIB hiredis REQUIRED)
find_path(HIREDIS_INCLUDE hiredis/hiredis.h REQUIRED)

include(FetchContent)
FetchContent_Declare(
    crow
    GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
    GIT_TAG        v1.0+5
)
FetchContent_MakeAvailable(crow)
file(GLOB_RECURSE SOURCES src/*.cpp)
add_executable(queue_engine ${SOURCES})

target_include_directories(queue_engine PRIVATE
  include
  ${HIREDIS_INCLUDE}
)

target_link_libraries(queue_engine PRIVATE
  ${HIREDIS_LIB}
  Crow::Crow
)
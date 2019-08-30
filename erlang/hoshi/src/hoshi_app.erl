%%%-------------------------------------------------------------------
%% @doc hoshi public API
%% @end
%%%-------------------------------------------------------------------

-module(hoshi_app).

-behaviour(application).

-export([start/2, stop/1]).

start(_StartType, _StartArgs) ->
    hoshi_sup:start_link().

stop(_State) ->
    ok.

%% internal functions

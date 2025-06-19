<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SipegProxyController extends Controller
{
    public function proxy($any, Request $request)
    {
        $url = "https://10.255.0.143/apisipeg/{$any}";
        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'Authorization' => 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ3YmUzOTkxNTczZDIxOWQ4NzdmNjNjNTVjYWY2YjMzNWM4Nzc2N2Nh',
        ])->withoutVerifying()->get($url, $request->all());

        // Forward status and content
        return response($response->body(), $response->status())
            ->header('Content-Type', $response->header('Content-Type'));
    }
}
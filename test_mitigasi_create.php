<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\IdentifyRisk;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

echo "=== Testing Mitigasi Create Logic ===\n\n";

// Simulate login as owner-risk user (ID: 3)
$ownerRiskUser = User::find(3);
Auth::login($ownerRiskUser);

echo "Logged in as: {$ownerRiskUser->name} (ID: {$ownerRiskUser->id})\n";
echo "User roles: " . $ownerRiskUser->roles->pluck('name')->implode(', ') . "\n\n";

// Test the same query used in MitigasiController@create
echo "=== Testing MitigasiController@create query ===\n";
$user = Auth::user();

$identifyRisksQuery = IdentifyRisk::select('id', 'id_identify', 'description')
                                 ->where('validation_status', 'approved');

// Filter berdasarkan role
if ($user->hasRole('owner-risk')) {
    echo "User has owner-risk role - filtering by user_id\n";
    $identifyRisksQuery->where('user_id', $user->id);
} elseif ($user->hasRole('pimpinan')) {
    echo "User has pimpinan role - filtering by unit_kerja\n";
    $identifyRisksQuery->where('unit_kerja', $user->unit_kerja);
} else {
    echo "User is super admin - no filtering\n";
}

$identifyRisks = $identifyRisksQuery->orderBy('id_identify')->get();

echo "\nQuery result:\n";
echo "Total risks found: " . $identifyRisks->count() . "\n\n";

if ($identifyRisks->count() > 0) {
    foreach ($identifyRisks as $risk) {
        echo "ID: {$risk->id} - Code: {$risk->id_identify} - Description: {$risk->description}\n";
    }
} else {
    echo "No approved risks found for this user!\n";
    
    // Debug: Check all approved risks
    echo "\n=== Debug: All approved risks ===\n";
    $allApprovedRisks = IdentifyRisk::where('validation_status', 'approved')->get();
    foreach ($allApprovedRisks as $risk) {
        echo "ID: {$risk->id} - Code: {$risk->id_identify} - User ID: {$risk->user_id} - Current User ID: {$user->id}\n";
    }
}

echo "\n=== Testing hasRole method ===\n";
echo "hasRole('owner-risk'): " . ($user->hasRole('owner-risk') ? 'true' : 'false') . "\n";
echo "hasRole('super-admin'): " . ($user->hasRole('super-admin') ? 'true' : 'false') . "\n";
echo "hasRole('pimpinan'): " . ($user->hasRole('pimpinan') ? 'true' : 'false') . "\n";
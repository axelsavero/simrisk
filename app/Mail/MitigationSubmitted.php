<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Mitigasi;

class MitigationSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public $mitigasi;

    public function __construct(Mitigasi $mitigasi)
    {
        $this->mitigasi = $mitigasi;
    }

    public function build()
    {
        return $this->subject('Mitigasi Baru Menunggu Persetujuan')
                    ->view('emails.mitigation_submitted')
                    ->with([
                        'mitigasi' => $this->mitigasi,
                    ]);
    }
}
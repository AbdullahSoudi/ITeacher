<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidYouTubeUrl implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $pattern = '/^https?:\/\/(www\.)?(youtube\.com\/(watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_\-]+/';

        if (! preg_match($pattern, $value)) {
            $fail('يجب أن يكون الرابط رابط YouTube صحيحاً.');
        }
    }
}

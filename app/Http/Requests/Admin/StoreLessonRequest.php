<?php

namespace App\Http\Requests\Admin;

use App\Rules\ValidYouTubeUrl;
use Illuminate\Foundation\Http\FormRequest;

class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:200'],
            'youtube_url' => ['required', 'string', new ValidYouTubeUrl()],
            'description' => ['nullable', 'string'],
            'order'       => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'       => 'عنوان الدرس مطلوب.',
            'youtube_url.required' => 'رابط YouTube مطلوب.',
        ];
    }
}

<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'course_ids'   => ['required', 'array'],
            'course_ids.*' => ['integer', 'exists:courses,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'course_ids.required' => 'يجب اختيار دورة واحدة على الأقل.',
            'course_ids.array'    => 'يجب أن تكون الدورات مصفوفة.',
            'course_ids.*.integer' => 'معرّفات الدورات يجب أن تكون أرقاماً.',
            'course_ids.*.exists'  => 'إحدى الدورات المختارة غير موجودة.',
        ];
    }
}

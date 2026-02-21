<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'max:150'],
            // Exclude soft-deleted rows so a recycled phone number is allowed
            'phone' => ['required', 'string', 'max:30', Rule::unique('users', 'phone')->whereNull('deleted_at')],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'   => 'الاسم مطلوب.',
            'phone.required'  => 'رقم الهاتف مطلوب.',
            'phone.unique'    => 'رقم الهاتف مستخدم بالفعل.',
        ];
    }
}

<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $studentId = $this->route('student')->id;

        return [
            'name'      => ['required', 'string', 'max:150'],
            // Ignore current student and soft-deleted rows
            'phone'     => ['required', 'string', 'max:30', Rule::unique('users', 'phone')->ignore($studentId)->whereNull('deleted_at')],
            'is_active' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'      => 'الاسم مطلوب.',
            'phone.required'     => 'رقم الهاتف مطلوب.',
            'phone.unique'       => 'رقم الهاتف مستخدم بالفعل.',
            'is_active.required' => 'حالة الحساب مطلوبة.',
        ];
    }
}

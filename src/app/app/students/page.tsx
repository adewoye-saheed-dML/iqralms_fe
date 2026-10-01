import * as React from 'react';
import { StudentDirectory } from '@/features/students/components/student-directory';

export const metadata = {
  title: 'Students | Quran Academy',
};

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <StudentDirectory />
    </div>
  );
}

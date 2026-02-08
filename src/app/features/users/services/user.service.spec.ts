import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

const mockUser: User = {
  _id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  role: 'student',
  createdAt: '',
  updatedAt: '',
};

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll returns users', () => {
    service.getAll().subscribe((users) => {
      expect(users).toEqual([mockUser]);
    });
    const req = httpMock.expectOne('http://localhost:3000/users');
    req.flush([mockUser]);
  });

  it('getOne returns user', () => {
    service.getOne('1').subscribe((user) => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne('http://localhost:3000/users/1');
    req.flush(mockUser);
  });

  it('create posts dto and returns user', () => {
    const dto: CreateUserDto = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@test.com',
      role: 'teacher',
    };
    service.create(dto).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne('http://localhost:3000/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockUser);
  });

  it('update patches and returns user', () => {
    const dto: UpdateUserDto = { firstName: 'Jane' };
    service.update('1', dto).subscribe((user) => {
      expect(user).toEqual(mockUser);
    });
    const req = httpMock.expectOne('http://localhost:3000/users/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush(mockUser);
  });

  it('delete sends DELETE', () => {
    service.delete('1').subscribe();
    const req = httpMock.expectOne('http://localhost:3000/users/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

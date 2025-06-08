// Fixed Customer Entity - Add this to your BeforeInsert hook
// File: src2/customers/entities/customer.entity.ts

// OPTION 1: Make last_login nullable in the entity
@Column({ name: 'last_login', nullable: true })
last_login: number;

// OPTION 2: Fix the BeforeInsert hook to set last_login
@BeforeInsert()
generateId() {
  this.id = `FF_CUS_${uuidv4()}`;
  this.created_at = Math.floor(Date.now() / 1000);
  this.updated_at = Math.floor(Date.now() / 1000);
  this.last_login = Math.floor(Date.now() / 1000); // ADD THIS LINE
}

// OPTION 3: Make it nullable AND set default in BeforeInsert
@Column({ name: 'last_login', nullable: true })
last_login: number;

@BeforeInsert()
generateId() {
  this.id = `FF_CUS_${uuidv4()}`;
  this.created_at = Math.floor(Date.now() / 1000);
  this.updated_at = Math.floor(Date.now() / 1000);
  this.last_login = Math.floor(Date.now() / 1000);
} 
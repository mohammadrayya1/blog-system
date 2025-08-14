<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250814211643 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE account CHANGE id id INT NOT NULL');
        $this->addSql('ALTER TABLE account ADD CONSTRAINT FK_7D3656A4BF396750 FOREIGN KEY (id) REFERENCES abstruct_account (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE admin_account CHANGE id id INT NOT NULL');
        $this->addSql('ALTER TABLE admin_account ADD CONSTRAINT FK_B90AD42DBF396750 FOREIGN KEY (id) REFERENCES abstruct_account (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE account DROP FOREIGN KEY FK_7D3656A4BF396750');
        $this->addSql('ALTER TABLE account CHANGE id id INT AUTO_INCREMENT NOT NULL');
        $this->addSql('ALTER TABLE admin_account DROP FOREIGN KEY FK_B90AD42DBF396750');
        $this->addSql('ALTER TABLE admin_account CHANGE id id INT AUTO_INCREMENT NOT NULL');
    }
}

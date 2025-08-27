<?php
namespace App\Command;

use App\Repository\PostRepository;
use App\Service\PostSearch;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:es:reindex-posts', description: 'Reindex all posts into Elasticsearch')]
class EsReindexPostsCommand extends Command
{
    public function __construct(
        private PostRepository $posts,
        private PostSearch $ps
    ) { parent::__construct(); }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->ps->createIndexIfMissing();
        foreach ($this->posts->findAll() as $post) {
            $this->ps->index($post);
        }
        $output->writeln('<info>Reindexed all posts.</info>');
        return Command::SUCCESS;
    }
}
